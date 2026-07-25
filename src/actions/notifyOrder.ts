'use server'

interface NotifyOrderParams {
    orderId: string
    customerPhone: string
    customerEmail?: string
    totalAmount: number
    items: Array<{ name: string; quantity: number; price: number; duration?: string }>
    discountAmount?: number
}

export async function sendInstantOrderNotification(params: NotifyOrderParams) {
    const { orderId, customerPhone, customerEmail, totalAmount, items, discountAmount = 0 } = params

    // 1. Prepare formatted Telegram Notification message
    const itemDetails = items
        .map((item, idx) => {
            const durLabel = item.duration ? ` (${item.duration})` : ''
            return `${idx + 1}. *${item.name}${durLabel}* (x${item.quantity}) - ৳${item.price * item.quantity}`
        })
        .join('\n')

    const messageText = `🛍️ *NEW ORDER PLACED!*
--------------------------------
🆔 *Order ID:* \`${orderId}\`
📞 *Customer Phone:* \`${customerPhone}\`
${customerEmail ? `📧 *Customer Email:* ${customerEmail}\n` : ''}
📦 *Items:*
${itemDetails}

💵 *Total Amount:* ৳${totalAmount} ${discountAmount > 0 ? `_(Discount: -৳${discountAmount})_` : ''}
⚡ *Status:* Pending Payment

👉 [View Admin Dashboard](https://guardifyit.com/en/admin/orders)`

    // 2. Telegram Bot Dispatch (If env credentials present)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (botToken && chatId) {
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: messageText,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            })
            console.log(`[Notification] Telegram alert sent successfully for Order #${orderId}`)
        } catch (err) {
            console.error('[Notification] Failed to send Telegram alert:', err)
        }
    } else {
        console.log(`[Notification] Telegram Bot credentials missing. Simulated order alert for #${orderId}:\n${messageText}`)
    }
}
