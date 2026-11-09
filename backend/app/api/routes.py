from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.transaction import Transaction
from app.schemas.order import ParseOrderRequest, CreatePaymentRequest, CapturePaymentRequest
from app.services.ai_service import parse_order_message, AIConfigurationError
from app.services.paypal_service import create_order, capture_order, PayPalConfigurationError, PayPalAPIError

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


@router.post("/ai/parse-order")
def ai_parse_order(payload: ParseOrderRequest):
    try:
        return parse_order_message(payload.message)
    except AIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI order extraction failed: {str(exc)}")


@router.post("/payments/create-order")
def payment_create_order(payload: CreatePaymentRequest, db: Session = Depends(get_db)):
    try:
        result = create_order([item.model_dump() for item in payload.items], payload.customer_name)
        transaction = Transaction(
            paypal_order_id=result["id"], amount=result["amount"], currency=result["currency"],
            status=result["status"], description=f"Order for {payload.customer_name}",
        )
        db.add(transaction)
        db.commit()
        return result
    except (PayPalConfigurationError, PayPalAPIError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/payments/capture")
def payment_capture(payload: CapturePaymentRequest, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.paypal_order_id == payload.order_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Order not found in PayPilot.")
    if transaction.status == "COMPLETED":
        return {"status": "COMPLETED", "order_id": payload.order_id, "message": "Payment was already captured."}
    try:
        result = capture_order(payload.order_id)
        status = result.get("status", "UNKNOWN")
        transaction.status = status
        db.commit()
        return {"status": status, "order_id": payload.order_id, "paypal_response": result}
    except PayPalAPIError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/payments/transactions")
def payment_transactions(db: Session = Depends(get_db)):
    rows = db.query(Transaction).order_by(Transaction.id.desc()).limit(50).all()
    return [{
        "id": row.id, "paypal_order_id": row.paypal_order_id, "amount": row.amount,
        "currency": row.currency, "status": row.status, "description": row.description,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    } for row in rows]
