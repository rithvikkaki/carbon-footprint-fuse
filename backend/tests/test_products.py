def test_list_products(client):
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) >= 4
    # Ensure sustainable watches exist in catalog
    watch_names = [p["name"] for p in products if p["category"] == "Watches"]
    assert any("Solios" in name for name in watch_names)

def test_order_product_with_cct_deduction(client, auth_headers):
    # Solios watch costs 24 CCT, test_user has 100 CCT
    order_res = client.post(
        "/api/v1/products/orders",
        headers=auth_headers,
        json={
            "product_id": "prod-watch-1",
            "payment_method": "CCT",
            "shipping_address": "404 Eco Way, San Francisco, CA",
        },
    )
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["product_name"] == "Solios Solar-Powered Recycled Steel Watch"
    assert order["status"] == "Confirmed"

    # Verify user balance was decremented by 24 (100 - 24 = 76)
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["credit_balance"] == 76.0

def test_order_product_insufficient_cct(client, auth_headers, test_user, db_session):
    # Set user balance to 5 CCT
    test_user.credit_balance = 5.0
    db_session.commit()

    order_res = client.post(
        "/api/v1/products/orders",
        headers=auth_headers,
        json={
            "product_id": "prod-watch-1",
            "payment_method": "CCT",
            "shipping_address": "404 Eco Way, San Francisco, CA",
        },
    )
    assert order_res.status_code == 400
    assert "Insufficient CCT balance" in order_res.json()["detail"]
