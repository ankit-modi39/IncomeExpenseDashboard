"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import ExpenseListTable from './_components/ExpenseListTable';
import { useUser } from '@clerk/nextjs';
import AddExpense from './_components/AddExpense';
import EditBudget from './_components/EditBudget';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [budgetInfo, setBudgetInfo] = useState();
  const { user } = useUser();
  const route = useRouter();

  useEffect(() => {
    user && getAllExpenses();
    user && getBudgetInfo();
  }, [user]);

  /**
   * Get Budget Information
   */
  const getBudgetInfo = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .groupBy(Budgets.id);

    setBudgetInfo(result[0]);
  };

  /**
   * Used to get All expenses belong to users
   */
  const getAllExpenses = async () => {
    const result = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt
      })
      .from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);
  };

  return (
    <div className='p-10'>
      <h2 className='text-2xl font-bold gap-2 flex justify-between items-center'>
        <span className='flex gap-2 items-center'>
          <ArrowLeft onClick={() => route.back()} className='cursor-pointer' />
          My Expenses
        </span>
        <div className='flex gap-2 items-center'>
          {budgetInfo && (
            <EditBudget
              budgetInfo={budgetInfo}
              refreshData={() => {
                getBudgetInfo();
                getAllExpenses();
              }}
            />
          )}
        </div>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 mt-6 gap-5'>
        <AddExpense
          budgetId={budgetInfo?.id}
          user={user}
          refreshData={() => {
            getBudgetInfo();
            getAllExpenses();
          }}
        />
      </div>

      <div className='mt-4'>
        <ExpenseListTable
          refreshData={() => {
            getBudgetInfo();
            getAllExpenses();
          }}
          expensesList={expensesList}
        />
      </div>
    </div>
  );
}

export default ExpensesScreen;