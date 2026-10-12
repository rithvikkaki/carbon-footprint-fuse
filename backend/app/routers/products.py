import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, SustainableProduct, ProductOrder
from backend.app.schemas import ProductOut, ProductOrderCreate, ProductOrderOut
from backend.app.security import get_current_user

router = APIRouter(prefix="/products", tags=["Sustainable Products Store"])

def serialize_product(p: SustainableProduct) -> dict:
    claims = []
    certs = []
    try:
        claims = json.loads(p.sustainability_claims) if p.sustainability_claims else []
    except Exception:
        claims = []
    try:
        certs = json.loads(p.certifications) if p.certifications else []
    except Exception:
        certs = []

    return {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "price_usd": p.price_usd,
        "price_eth": p.price_eth,
        "price_cct": p.price_cct,
        "seller": p.seller,
        "description": p.description,
        "sustainability_claims": claims,
        "materials": p.materials,
        "stock": p.stock,
        "rating": p.rating,
        "image_url": p.image_url,
        "certifications": certs,
    }

@router.get("", response_model=List[ProductOut])
def list_sustainable_products(db: Session = Depends(get_db)):
    products = db.query(SustainableProduct).all()
    return [serialize_product(p) for p in products]

@router.get("/{product_id}", response_model=ProductOut)
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    prod = db.query(SustainableProduct).filter(SustainableProduct.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return serialize_product(prod)

@router.post("/orders", response_model=ProductOrderOut, status_code=status.HTTP_201_CREATED)
def place_product_order(
    order_in: ProductOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        prod = (
            db.query(SustainableProduct)
            .filter(SustainableProduct.id == order_in.product_id)
            .with_for_update()
            .first()
        )
        if not prod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        if prod.stock <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{prod.name} is currently out of stock.",
            )

        buyer = (
            db.query(User)
            .filter(User.id == current_user.id)
            .with_for_update()
            .first()
        )
        if not buyer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer account not found.")

        # Server authorization for CCT deductions
        if order_in.payment_method == "CCT":
            if buyer.credit_balance < prod.price_cct:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient CCT balance. Required: {prod.price_cct} CCT, Available: {buyer.credit_balance} CCT.",
                )
            buyer.credit_balance = round(buyer.credit_balance - prod.price_cct, 2)
            price_paid_str = f"{prod.price_cct} CCT"
        elif order_in.payment_method == "ETH":
            price_paid_str = f"{prod.price_eth} ETH (Demo)"
        else:
            price_paid_str = f"${prod.price_usd} USD (Demo)"

        # Decrement stock
        prod.stock -= 1

        order = ProductOrder(
            user_id=buyer.id,
            product_id=prod.id,
            product_name=prod.name,
            buyer_name=buyer.name,
            price_paid=price_paid_str,
            payment_method=order_in.payment_method,
            shipping_address=order_in.shipping_address,
            status="Confirmed",
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order
    except HTTPException:
        raise
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise

@router.get("/orders/me", response_model=List[ProductOrderOut])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(ProductOrder)
        .filter(ProductOrder.user_id == current_user.id)
        .order_by(ProductOrder.created_at.desc())
        .all()
    )
