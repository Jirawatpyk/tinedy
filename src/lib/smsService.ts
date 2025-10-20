/**
 * Simulates sending an SMS message.
 * In a real application, this would integrate with an SMS gateway provider like Twilio.
 * @param phoneNumber The customer's phone number.
 * @param message The message to send.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export const sendSms = async (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  console.log("--- MOCK SMS SERVICE ---");
  console.log(`Sending SMS to: ${phoneNumber}`);
  console.log(`Message: "${message}"`);
  console.log("------------------------");

  // Simulate a network request
  await new Promise(resolve => setTimeout(resolve, 500));

  // Basic validation for demonstration purposes
  if (!phoneNumber || phoneNumber.length < 5) {
    const errorMsg = "Invalid phone number provided.";
    console.error(`SMS Error: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }

  // Simulate a successful send
  return { success: true, message: "SMS sent successfully (simulated)." };
};
