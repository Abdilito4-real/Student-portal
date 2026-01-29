'use client';

import { useState, useMemo } from 'react';
import { collection, doc, query, where } from 'firebase/firestore';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Loader2, ArrowLeft, Edit, Trash2, BookOpen, CreditCard } from 'lucide-react';
import type { Student, FeeRecord } from '@/lib/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteStudent as deleteStudentFlow } from '@/ai/flows/delete-student-flow';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import StudentForm from './student-form';
import FeeManagementDialog from './fee-management-dialog';
import ResultManagementDialog from './result-management-dialog';

export default function StudentManagement({ classId }: { classId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [filter, setFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isStudentFormOpen, setStudentFormOpen] = useState(false);
  
  const [feeStudent, setFeeStudent] = useState<Student | null>(null);
  const [resultStudent, setResultStudent] = useState<Student | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'students'), where('classId', '==', classId));
  }, [firestore, classId, user]);
  const { data: students, isLoading: isLoadingStudents } = useCollection<Student>(studentsQuery);

  const feesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'fees');
  }, [firestore, user]);
  const { data: allFees } = useCollection<FeeRecord>(feesQuery);

  const feesByStudentId = useMemo(() => {
    const map = new Map<string, FeeRecord>();
    allFees?.forEach(fee => map.set(fee.studentId, fee));
    return map;
  }, [allFees]);

  const filteredStudents = useMemo(() => 
    students?.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(filter.toLowerCase())) ?? [], 
    [students, filter]
  );
  
  const performDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
        const res = await deleteStudentFlow({ uid: studentToDelete.id });
        if (res.success) toast({ title: 'Student Deleted' });
        else throw new Error(res.error);
    } catch (e: any) {
        toast({ title: 'Deletion Failed', variant: 'destructive' });
    } finally {
        setIsDeleting(false);
        setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Button asChild variant="outline"><Link href="/admin/classes"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Input placeholder="Search students..." value={filter} onChange={e => setFilter(e.target.value)} className="w-40 sm:w-64" />
          <Button onClick={() => { setSelectedStudent(null); setStudentFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Student</Button>
        </div>
      </div>

      <TooltipProvider>
        <Card>
          <CardContent className="p-0">
              <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Fee Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                  {isLoadingStudents ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-10"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                  ) : filteredStudents.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No students found in this class.</TableCell></TableRow>
                  ) : filteredStudents.map(student => {
                      const feeRecord = feesByStudentId.get(student.id);
                      const feeStatus = feeRecord?.status;
                      const badgeVariant = feeStatus === 'Paid' ? 'success' : feeStatus === 'Partial' ? 'warning' : feeStatus === 'Pending' ? 'destructive' : 'outline';
                      
                      return (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                            <TableCell><Badge variant={badgeVariant}>{feeStatus || 'Not Set'}</Badge></TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setFeeStudent(student)}><CreditCard className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Manage Fees</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setResultStudent(student)}><BookOpen className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Manage Results</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => { setSelectedStudent(student); setStudentFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Profile</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setStudentToDelete(student)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete Student</TooltipContent>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                      );
                  })}
              </TableBody>
              </Table>
          </CardContent>
        </Card>
      </TooltipProvider>

      <Dialog open={isStudentFormOpen} onOpenChange={setStudentFormOpen}>
        <DialogContent>
            {isStudentFormOpen && <StudentForm setOpen={setStudentFormOpen} student={selectedStudent || undefined} preselectedClassId={classId} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!feeStudent} onOpenChange={(open) => !open && setFeeStudent(null)}>
        <DialogContent className="max-w-2xl">
            {feeStudent && <FeeManagementDialog student={feeStudent} onClose={() => setFeeStudent(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!resultStudent} onOpenChange={(open) => !open && setResultStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {resultStudent && <ResultManagementDialog student={resultStudent} onClose={() => setResultStudent(null)} />}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
                This action is permanent. It will delete the student's profile, authentication account, all academic results, and fee records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performDeleteStudent} className={buttonVariants({ variant: 'destructive' })} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
