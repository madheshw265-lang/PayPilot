from decimal import Decimal, ROUND_HALF_UP
import httpx
from app.core.config import settings


class PayPalConfigurationError(Exception):
    pass


class PayPalAPIError(Exception):
    pass


def _credentials() -> tuple[str, str]:
    if not settings.paypal_client_id or not settings.paypal_client_secret:
        raise PayPalConfigurationError("PayPal Sandbox credentials are missing. Add them to backend/.env.")
    return settings.paypal_client_id, settings.paypal_client_secret


def _access_token(client: httpx.Client) -> str:
    client_id, secret = _credentials()
    response = client.post(
        f"{settings.paypal_base_url}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        auth=(client_id, secret),
        headers={"Accept": "application/json", "Accept-Language": "en_US"},
    )
    if response.is_error:
        raise PayPalAPIError(f"PayPal authentication failed: {response.text[:300]}")
    return response.json()["access_token"]


def _money(value: Decimal) -> str:
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def create_order(items: list[dict], customer_name: str) -> dict:
    currency = settings.paypal_currency.upper()
    total = Decimal("0.00")
    paypal_items = []
    for item in items:
        unit_price = Decimal(str(item["unit_price"]))
        quantity = int(item["quantity"])
        line_total = unit_price * quantity
        total += line_total
        paypal_items.append({
            "name": item["name"][:120],
            "quantity": str(quantity),
            "unit_amount": {"currency_code": currency, "value": _money(unit_price)},
        })
    total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if total <= 0:
        raise ValueError("Order total must be greater than zero.")

    with httpx.Client(timeout=25) as client:
        token = _access_token(client)
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "description": f"PayPilot order for {customer_name}"[:127],
                "amount": {
                    "currency_code": currency,
                    "value": _money(total),
                    "breakdown": {"item_total": {"currency_code": currency, "value": _money(total)}},
                },
                "items": paypal_items,
            }],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "brand_name": settings.paypal_brand_name,
                        "user_action": "PAY_NOW",
                        "return_url": f"{settings.frontend_url}/?payment=success",
                        "cancel_url": f"{settings.frontend_url}/?payment=cancelled",
                    }
                }
            },
        }
        response = client.post(
            f"{settings.paypal_base_url}/v2/checkout/orders",
            json=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        if response.is_error:
            raise PayPalAPIError(f"PayPal order creation failed: {response.text[:500]}")
        data = response.json()
        approve_url = next((link["href"] for link in data.get("links", []) if link.get("rel") == "payer-action"), None)
        if not approve_url:
            approve_url = next((link["href"] for link in data.get("links", []) if link.get("rel") == "approve"), None)
        return {"id": data["id"], "status": data["status"], "approve_url": approve_url, "amount": _money(total), "currency": currency}


def capture_order(order_id: str) -> dict:
    with httpx.Client(timeout=25) as client:
        token = _access_token(client)
        response = client.post(
            f"{settings.paypal_base_url}/v2/checkout/orders/{order_id}/capture",
            json={},
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        if response.is_error:
            raise PayPalAPIError(f"PayPal capture failed: {response.text[:500]}")
        return response.json()
