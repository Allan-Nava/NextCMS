/*
 * File: mailer.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// Outbound email (NC-39).
//
// NO REAL PROVIDER IS CONFIGURED. This project has no mail infrastructure, so
// the default transport writes the message to the log instead of sending it —
// and only outside production, because a reset link in a production log is a
// credential lying in plain text.
//
// To wire a real provider, implement `MailTransport` and pass it to
// `setMailTransport` from a server bootstrap. Everything else stays unchanged.
//
import { envOrDefault, isProduction } from '../utils/env';
import { logger } from '../utils/logger';
//
export interface MailMessage {
    to: string;
    subject: string;
    text: string;
}
//
export interface MailTransport {
    send(message: MailMessage): Promise<void>;
}
//
const logTransport: MailTransport = {
    async send(message: MailMessage): Promise<void> {
        if (isProduction()) {
            // Never print the body: it carries the reset link.
            logger.error('no mail transport configured, message dropped', { subject: message.subject });
            return;
        }
        logger.info('mail (dev transport, not sent)', { to: message.to, subject: message.subject });
        logger.debug(message.text);
    },
};
//
let transport: MailTransport = logTransport;
//
export function setMailTransport(next: MailTransport): void {
    transport = next;
}
//
export async function sendMail(message: MailMessage): Promise<void> {
    await transport.send(message);
}
//
export function passwordResetMessage(to: string, token: string): MailMessage {
    const baseUrl = envOrDefault('BASE_URI', 'http://localhost:3000');
    const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    return {
        to,
        subject: 'Reset your NextCMS password',
        text: [
            'Someone asked to reset the password for this account.',
            '',
            `Open this link to choose a new one: ${link}`,
            '',
            'If it was not you, ignore this message: the link expires on its own and',
            'your current password keeps working.',
        ].join('\n'),
    };
}
//
