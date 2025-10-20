import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { savePushSubscription, deletePushSubscription } from '../dal/notifications';

// In a real app, this key should come from an environment variable.
// This is your VAPID public key.
const VAPID_PUBLIC_KEY = 'BPaIMrAuy-iinK780XrE2beClQOb9TP2j6H0xmvr9W8YMCTuJWjRRahP9luJJTWgJI5jEDPRjHJ-Q7q2gazNdh0'; // TODO: Replace with actual key

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const user = useAuthStore(state => state.user);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
    const [error, setError] = useState<string | null>(null);

    const initialize = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return;
        }

        try {
            // The service worker is registered in index.tsx. 
            // Here, we wait for that registration to become active.
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker is ready with scope:', registration.scope);
            
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
                console.log('User IS subscribed.');
                setIsSubscribed(true);
                setSubscription(sub);
            }
            setPermissionStatus(Notification.permission);
        } catch (err) {
            console.error('Service Worker readiness check failed: ', err);
            setError('Service Worker is not ready. Push notifications may not work.');
        }
    }, []);

    const subscribe = useCallback(async () => {
        if (!user) {
            setError("User not logged in.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        try {
            const currentPermission = await Notification.requestPermission();
            setPermissionStatus(currentPermission);
            
            if (currentPermission !== 'granted') {
                console.log('Permission not granted for Notification');
                return;
            }

            console.log('Subscribing to push...');
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log('User is subscribed:', sub);
            await savePushSubscription(user.id, sub.toJSON());
            
            setSubscription(sub);
            setIsSubscribed(true);

        } catch (err) {
            console.error('Failed to subscribe the user: ', err);
            setError('Failed to subscribe for notifications.');
        }
    }, [user]);
    
    const unsubscribe = useCallback(async () => {
        if (!user) {
            setError("User not logged in.");
            return;
        }
        
        if (subscription) {
            try {
                await subscription.unsubscribe();
                console.log('User is unsubscribed.');
                await deletePushSubscription(user.id);
                setSubscription(null);
                setIsSubscribed(false);
            } catch (err) {
                console.error('Error during unsubscription', err);
                setError('Failed to unsubscribe.');
            }
        }
    }, [subscription, user]);

    return {
        isSubscribed,
        permissionStatus,
        error,
        initialize,
        subscribe,
        unsubscribe,
    };
};