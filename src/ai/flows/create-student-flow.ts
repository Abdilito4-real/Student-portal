'use server';
/**
 * @fileOverview A server action for securely creating a new Firebase Authentication
 * user.
 *
 * - createStudentAuthUser - The exported function to create the user.
 * - CreateStudentAuthUserInput - The Zod schema for the input.
 * - CreateStudentAuthUserOutput - The Zod schema for the output.
 */

import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase-admin';

// Input schema for creating a student auth user
const CreateStudentAuthUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});
export type CreateStudentAuthUserInput = z.infer<typeof CreateStudentAuthUserInputSchema>;

// Output schema for the result
const CreateStudentAuthUserOutputSchema = z.object({
  uid: z.string().optional(),
  error: z.string().optional(),
});
export type CreateStudentAuthUserOutput = z.infer<typeof CreateStudentAuthUserOutputSchema>;

// Exported function to be called from the client
export async function createStudentAuthUser(input: CreateStudentAuthUserInput): Promise<CreateStudentAuthUserOutput> {
  // Validate input against the Zod schema
  const parsedInput = CreateStudentAuthUserInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const auth = getAdminAuth();
    
    if (!auth) {
      return { error: 'Firebase Admin SDK not initialized. Please ensure FIREBASE_SERVICE_ACCOUNT_JSON is set in environment variables.' };
    }

    // 1. Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      displayName: `${parsedInput.data.firstName} ${parsedInput.data.lastName}`,
    });

    const uid = userRecord.uid;

    // 2. Return the new user's UID on success.
    // The client will now be responsible for creating the Firestore document.
    return { uid };

  } catch (error: any) {
    // If an error occurs, return a structured error object
    let errorMessage = 'An unexpected error occurred during user creation.';
    if (error.code) {
      // Firebase Admin SDK often provides error codes
      errorMessage = `Error (${error.code}): ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Error in createStudentAuthUser:', errorMessage);
    return { error: errorMessage };
  }
}
