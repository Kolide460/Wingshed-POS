import type { Order, OrderItem } from '@/types'

export function generateReceiptHTML(order: Order, items: OrderItem[]): string {
  const lineItems = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:2px 0">${i.quantity}x ${i.menu_item_name}</td>
          <td style="text-align:right;padding:2px 0">£${(i.unit_price * i.quantity).toFixed(2)}</td>
        </tr>${i.notes ? `<tr><td colspan="2" style="font-size:11px;color:#666;padding-left:12px;padding-bottom:4px">Note: ${i.notes}</td></tr>` : ''}`
    )
    .join('')

  const pickupDate = new Date(order.pickup_time)
  const pickupStr = pickupDate.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Order #${order.order_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    width: 72mm;
    padding: 4mm;
    color: #000;
  }
  h1 { font-size: 18px; text-align: center; letter-spacing: 2px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  .total { font-size: 15px; font-weight: bold; }
  .big { font-size: 22px; font-weight: bold; text-align: center; margin: 4px 0; }
  @media print {
    body { width: 72mm; }
    button { display: none; }
  }
</style>
</head>
<body>
  <h1>WINGSHED</h1>
  <div class="center" style="font-size:11px">Collection order</div>
  <div class="divider"></div>
  <div class="big">#${order.order_number}</div>
  <div class="center">${order.customer_name}${order.customer_phone ? ` · ${order.customer_phone}` : ''}</div>
  <div class="center" style="margin-top:4px"><strong>Pickup: ${pickupStr}</strong></div>
  <div class="divider"></div>
  <table>
    ${lineItems}
  </table>
  <div class="divider"></div>
  <table>
    <tr class="total">
      <td>TOTAL</td>
      <td style="text-align:right">£${Number(order.total).toFixed(2)}</td>
    </tr>
    <tr>
      <td>Payment</td>
      <td style="text-align:right">${order.payment_method === 'stripe' ? 'Paid online' : 'Pay on collection'}</td>
    </tr>
  </table>
  ${order.order_notes ? `<div class="divider"></div><div><strong>Notes:</strong> ${order.order_notes}</div>` : ''}
  <div class="divider"></div>
  <div class="center" style="font-size:11px">Thank you!</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`
}
