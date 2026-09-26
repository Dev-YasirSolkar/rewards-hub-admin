const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function sendTelegramMessage(chatId: number | string, text: string, options?: {
  parseMode?: 'HTML' | 'Markdown';
  replyMarkup?: unknown;
}): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || 'HTML',
        reply_markup: options?.replyMarkup,
      }),
    });
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export async function notifyWithdrawalApproved(telegramId: number, amount: number) {
  await sendTelegramMessage(telegramId,
    `\u2705 <b>Withdrawal Approved!</b>\n\nYour withdrawal of <b>${amount} points</b> has been approved and is being processed.`,
    { parseMode: 'HTML' }
  );
}

export async function notifyWithdrawalRejected(telegramId: number, amount: number, reason: string) {
  await sendTelegramMessage(telegramId,
    `\u274c <b>Withdrawal Rejected</b>\n\nYour withdrawal of <b>${amount} points</b> was not approved.\n\nReason: ${reason}\n\nYour balance has been restored.`,
    { parseMode: 'HTML' }
  );
}

export async function sendBroadcast(userIds: number[], message: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (const userId of userIds) {
    const success = await sendTelegramMessage(userId, message, { parseMode: 'HTML' });
    if (success) sent++;
    else failed++;
    
    // Rate limit: max 30 messages per second (Telegram limit)
    await new Promise(resolve => setTimeout(resolve, 35));
  }
  
  return { sent, failed };
}
