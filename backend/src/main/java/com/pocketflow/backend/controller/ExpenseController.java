package com.pocketflow.backend.controller;

import com.pocketflow.backend.model.Expense;
import com.pocketflow.backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public List<Expense> getAllExpenses(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        if (userEmail != null && !userEmail.isEmpty()) {
            return expenseRepository.findByUserEmail(userEmail);
        }
        return expenseRepository.findAll();
    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense, @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        if (userEmail != null && !userEmail.isEmpty()) {
            expense.setUserEmail(userEmail);
        }
        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails, @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        if (userEmail != null && !userEmail.isEmpty() && expense.getUserEmail() != null && !expense.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized update request");
        }

        expense.setTitle(expenseDetails.getTitle());
        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setPaymentMethod(expenseDetails.getPaymentMethod());
        
        return expenseRepository.save(expense);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id, @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        if (userEmail != null && !userEmail.isEmpty() && expense.getUserEmail() != null && !expense.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized delete request");
        }

        expenseRepository.delete(expense);
    }
}
