import { db } from '../firebase';
import { setDoc, getDoc, doc, runTransaction, type Transaction } from "firebase/firestore";
import { type Counter } from '../types/counter';

// Initialize counter
export const initializeCounter = async (): Promise<void> => {
    try {
        const counters= {
            'request': 1000,
            'session': 1000,
            'feedback': 1000,
            'notification': 1000
        }
        await setDoc(doc(db, 'counters', 'ids'), counters);
    } catch (error) {
        console.error('Error creating counter: ', error);
        throw new Error('Failed to create counter: ' + error);
    }
}

// Make sure counter document exists
export const checkCounterDoc = async (): Promise<Counter> => {
    try {
        let counterDoc = await getDoc(doc(db, 'counters', 'ids'));
        if (!counterDoc.exists()) {
            await initializeCounter();
            counterDoc = await getDoc(doc(db, 'counters', 'ids'));
        }
        return counterDoc.data() as Counter;
    } catch (error) {
        console.error('Error fetching counter: ', error);
        throw new Error('Failed to fetch counter: ' + error);
    }
}

// Generate next id
export const generateNextId = async (field: keyof Counter): Promise<number> => {
    try {
        await checkCounterDoc();
        return await runTransaction(db, (transaction) => bumpCounter(transaction, field));
    } catch (error) {
        console.error('Error generating next id: ', error);
        throw new Error('Failed to generate next id: ' + error);
    }
}

// Bump counter with transaction
export const bumpCounter = async (transaction: Transaction, field: keyof Counter): Promise<number> => {
    const counterDoc = doc(db, 'counters', 'ids')
    const snap = await transaction.get(counterDoc);
    const next = (snap.data() as Counter)[field] + 1;
    transaction.update(counterDoc, { [field]: next });
    return next;
}