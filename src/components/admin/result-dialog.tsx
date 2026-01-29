'use client';

import { useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import type { AcademicResult, Student } from '@/lib/types';

const resultSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  term: z.enum(['1st', '2nd', '3rd']),
  year: z.coerce.number().min(2000),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  comments: z.string().optional(),
});

export function ResultDialog({ student }: { student: Student }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingResult, setEditingResult] = useState<AcademicResult | null>(null);

  const resultsQuery = useMemoFirebase(() =>
    query(collection(firestore, 'academicResults'), where('studentId', '==', student.id), orderBy('createdAt', 'desc')),
    [firestore, student.id]
  );
  const { data: results, isLoading } = useCollection<AcademicResult>(resultsQuery);

  const form = useForm<z.infer<typeof resultSchema>>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      subject: '',
      term: '1st',
      year: new Date().getFullYear(),
      grade: 'C',
      comments: '',
    },
  });

  async function onSubmit(values: z.infer<typeof resultSchema>) {
    try {
      if (editingResult) {
        await updateDoc(doc(firestore, 'academicResults', editingResult.id), {
          className: values.subject, // Map subject to className as per types.ts
          term: values.term,
          year: values.year,
          grade: values.grade,
          comments: values.comments,
        });
        toast({ title: 'Result Updated' });
      } else {
        await addDoc(collection(firestore, 'academicResults'), {
          studentId: student.id,
          className: values.subject,
          term: values.term,
          year: values.year,
          grade: values.grade,
          comments: values.comments,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Result Added' });
      }
      setIsAdding(false);
      setEditingResult(null);
      form.reset();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }

  const deleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await deleteDoc(doc(firestore, 'academicResults', id));
      toast({ title: 'Result Deleted' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Academic Results: {student.firstName} {student.lastName}</DialogTitle>
        <DialogDescription>Manage academic performance for this student.</DialogDescription>
      </DialogHeader>

      {isAdding || editingResult ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem><FormLabel>Grade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'F'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
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
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="comments" render={({ field }) => (
              <FormItem><FormLabel>Comments</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingResult(null); }}>Cancel</Button>
              <Button type="submit">{editingResult ? 'Update' : 'Add'} Result</Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <Button onClick={() => setIsAdding(true)} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Result</Button>
          <div className="rounded-md border max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Grade</TableHead><TableHead>Term</TableHead><TableHead>Year</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></TableCell></TableRow>
                ) : results?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No results found.</TableCell></TableRow>
                ) : results?.map(res => (
                  <TableRow key={res.id}>
                    <TableCell>{res.className}</TableCell>
                    <TableCell>{res.grade}</TableCell>
                    <TableCell>{res.term}</TableCell>
                    <TableCell>{res.year}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingResult(res);
                        form.reset({ subject: res.className, grade: res.grade, term: res.term, year: res.year, comments: res.comments });
                      }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteResult(res.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
