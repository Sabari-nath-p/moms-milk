import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
    private readonly messaging: admin.messaging.Messaging;

    constructor() {
        this.messaging = admin.messaging();
    }

    async sendPushNotification(
        token: string,
        title: string,
        body: string,
        data?: { [key: string]: string }
    ) {
        try {
            const message: Message = {
                notification: {
                    title,
                    body,
                },
                data,
                token,
            };

            const response = await this.messaging.send(message);
            return response;
        } catch (error) {
            throw new Error(`Failed to send push notification: ${error.message}`);
        }
    }

    async sendMulticastNotification(
        tokens: string[],
        title: string,
        body: string,
        data?: { [key: string]: string }
    ) {
        try {
            // Send to each token individually since older versions of firebase-admin don't have sendMulticast
            const messages = tokens.map(token => ({
                notification: {
                    title,
                    body,
                },
                data,
                token,
            }));

            const responses = await Promise.all(
                messages.map(message => this.messaging.send(message))
            );
            
            return {
                successCount: responses.length,
                responses: responses
            };
        } catch (error) {
            throw new Error(`Failed to send multicast notification: ${error.message}`);
        }
    }
}
