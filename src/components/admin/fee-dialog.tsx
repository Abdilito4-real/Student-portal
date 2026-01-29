'use client';

import { useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2, Trash2, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { FeeRecord, Student } from '@/lib/types';

const feeSchema = z.object({
  term: z.enum(['1st', '2nd', '3rd']),
  session: z.string().min(1, 'Session is required.'),
  amount: z.coerce.number().min(0),
  amountPaid: z.coerce.number().min(0),
  status: z.enum(['Paid', 'Pending', 'Partial']),
  dueDate: z.string().min(1, 'Due date is required.'),
});

export function FeeDialog({ student }: { student: Student }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);

  const feesQuery = useMemoFirebase(() =>
    query(collection(firestore, 'fees'), where('studentId', '==', student.id), orderBy('createdAt', 'desc')),
    [firestore, student.id]
  );
  const { data: fees, isLoading } = useCollection<FeeRecord>(feesQuery);

  const form = useForm<z.infer<typeof feeSchema>>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      term: '1st',
      session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      amount: 0,
      amountPaid: 0,
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof feeSchema>) {
    const balanceRemaining = values.amount - values.amountPaid;
    try {
      if (editingFee) {
        await updateDoc(doc(firestore, 'fees', editingFee.id), {
          ...values,
          balanceRemaining,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Fee Record Updated' });
      } else {
        await addDoc(collection(firestore, 'fees'), {
          ...values,
          studentId: student.id,
          balanceRemaining,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Fee Record Added' });
      }
      setIsAdding(false);
      setEditingFee(null);
      form.reset();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }

  const deleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await deleteDoc(doc(firestore, 'fees', id));
      toast({ title: 'Fee Record Deleted' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Fee Status: {student.firstName} {student.lastName}</DialogTitle>
        <DialogDescription>Manage fee payments and balance for this student.</DialogDescription>
      </DialogHeader>

      {isAdding || editingFee ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="term" render={({ field }) => (
                <FormItem><FormLabel>Term</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {['1st', '2nd', '3rd'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="session" render={({ field }) => (
                <FormItem><FormLabel>Session</FormLabel><FormControl><Input {...field} placeholder="e.g. 2023/2024" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Total Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="amountPaid" render={({ field }) => (
                <FormItem><FormLabel>Amount Paid</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {['Paid', 'Pending', 'Partial'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingFee(null); }}>Cancel</Button>
              <Button type="submit">{editingFee ? 'Update' : 'Add'} Fee Record</Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <Button onClick={() => setIsAdding(true)} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Fee Record</Button>
          <div className="rounded-md border max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Term/Session</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></TableCell></TableRow>
                ) : fees?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No fee records found.</TableCell></TableRow>
                ) : fees?.map(fee => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.term} / {fee.session}</TableCell>
                    <TableCell>${fee.amount}</TableCell>
                    <TableCell>${fee.amountPaid}</TableCell>
                    <TableCell>
                      <Badge variant={fee.status === 'Paid' ? 'success' : fee.status === 'Pending' ? 'destructive' : 'warning'}>{fee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingFee(fee);
                        form.reset({ term: fee.term, session: fee.session, amount: fee.amount, amountPaid: fee.amountPaid || 0, status: fee.status, dueDate: fee.dueDate });
                      }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteFee(fee.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
