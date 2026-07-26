/*
 * File: password-reset.test.ts
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
//
// The reset flow's security rests on two properties: the database stores only a
// hash of the token, and the reset link is never printed in production (NC-39).
//
import { hashToken } from '../lib/helpers/password-reset';
import { passwordResetMessage, sendMail, setMailTransport } from '../lib/helpers/mailer';
//
describe('hashToken', () => {
    it('produces a stable sha256 hex digest', () => {
        expect(hashToken('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    });

    it('does not return the token itself', () => {
        const token = 'a-secret-reset-token';
        expect(hashToken(token)).not.toContain(token);
        expect(hashToken(token)).toHaveLength(64);
    });

    it('gives different digests for different tokens', () => {
        expect(hashToken('one')).not.toBe(hashToken('two'));
    });
});
//
describe('passwordResetMessage', () => {
    const previousBase = process.env.BASE_URI;

    afterEach(() => {
        process.env.BASE_URI = previousBase;
    });

    it('builds the link from BASE_URI', () => {
        process.env.BASE_URI = 'https://cms.example.com';
        const message = passwordResetMessage('user@example.com', 'tok');
        expect(message.text).toContain('https://cms.example.com/reset-password?token=tok');
        expect(message.to).toBe('user@example.com');
    });

    it('url-encodes the token', () => {
        process.env.BASE_URI = 'https://cms.example.com';
        expect(passwordResetMessage('user@example.com', 'a+b/c').text).toContain('token=a%2Bb%2Fc');
    });
});
//
describe('default mail transport', () => {
    // NODE_ENV is typed read-only by @types/node, hence the cast.
    const env = process.env as Record<string, string | undefined>;
    const previousEnv = env.NODE_ENV;

    afterEach(() => {
        env.NODE_ENV = previousEnv;
        jest.restoreAllMocks();
    });

    it('never prints the message body in production', async () => {
        env.NODE_ENV = 'production';
        const log = jest.spyOn(console, 'log').mockImplementation(() => {});
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        await sendMail(passwordResetMessage('user@example.com', 'super-secret-token'));
        const printed = [...log.mock.calls, ...error.mock.calls].flat().join(' ');
        expect(printed).not.toContain('super-secret-token');
        expect(error).toHaveBeenCalled();
    });

    it('can be replaced by a real transport', async () => {
        const sent: string[] = [];
        setMailTransport({
            async send(message) {
                sent.push(message.subject);
            },
        });
        await sendMail({ to: 'a@b.c', subject: 'hello', text: 'body' });
        expect(sent).toEqual(['hello']);
    });
});
//
