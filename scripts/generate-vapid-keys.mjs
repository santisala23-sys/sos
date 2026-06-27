import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("\nAgregá esto a .env.local y Vercel:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:tu-email@ejemplo.com\n");
