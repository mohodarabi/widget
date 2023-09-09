import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class NotificationService {

    constructor(private readonly configService: ConfigService) { }

    async sendPushNotification(userID: string, message: string) {
        try {

            const apiKey = this.configService.get('ONESIGNAL_API_KEY')
            const appId = this.configService.get('ONESIGNAL_APP_ID')

            const app_key_provider = {
                getToken() {
                    return apiKey
                }
            };

            const configuration = OneSignal.createConfiguration({
                authMethods: {
                    app_key: {
                        tokenProvider: app_key_provider
                    }
                }
            });

            const client = new OneSignal.DefaultApi(configuration);

            const notification = new OneSignal.Notification();
            notification.app_id = appId;
            notification.include_external_user_ids = [userID]
            notification.content_available = true
            notification.contents = { 'en': message }

            return client.createNotification(notification);

        } catch (error) {
            console.log(error);
            return {
                message: 'something went wrong',
                status: 500,
                type: 'error'
            }
        }
    }
}