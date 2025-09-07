// Financial Tracker Application
class FinancialTracker {
    constructor() {
        this.storageKeys = {
            balance: 'financial_balance',
            dailyTarget: 'daily_target',
            transactions: 'transactions',
            currentMission: 'current_mission'
        };
        
        this.currentMission = this.loadMissionData();
        this.balance = this.loadBalance();
        this.dailyTarget = this.loadDailyTarget();
        this.transactions = this.loadTransactions();
        
        this.initializeDOM();
        this.bindEvents();
        this.startRealTimeClock();
        this.checkForNewDay();
        this.updateDisplay();
        
        // Auto-save interval
        setInterval(() => this.autoSave(), 30000); // Save every 30 seconds
    }
    
    // Data Structure: Using Map for O(1) lookup performance
    initializeDOM() {
        this.elements = new Map([
            ['currentDate', document.getElementById('current-date')],
            ['currentTime', document.getElementById('current-time')],
            ['totalBalance', document.getElementById('total-balance')],
            ['availableBalance', document.getElementById('available-balance')],
            ['currentDay', document.getElementById('current-day')],
            ['dailyTargetDisplay', document.getElementById('daily-target')],
            ['todaysExpenses', document.getElementById('todays-expenses')],
            ['expenseProgress', document.getElementById('expense-progress')],
            ['transactionsList', document.getElementById('transactions-list')],
            ['missionGrid', document.getElementById('mission-grid')],
            ['modal', document.getElementById('modal')],
            ['historyModal', document.getElementById('history-modal')],
            ['modalTitle', document.getElementById('modal-title')],
            ['modalForm', document.getElementById('modal-form')],
            ['formFields', document.getElementById('form-fields')],
            ['historyList', document.getElementById('history-list')],
            ['historyFilter', document.getElementById('history-filter')],
            ['loading', document.getElementById('loading')],
            ['toast', document.getElementById('toast')]
        ]);
    }
    
    bindEvents() {
        // Quick action buttons
        document.getElementById('deposit-btn').addEventListener('click', () => this.showDepositModal());
        document.getElementById('withdraw-btn').addEventListener('click', () => this.showWithdrawModal());
        document.getElementById('set-target-btn').addEventListener('click', () => this.showTargetModal());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistoryModal());
        
        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Form submission
        this.elements.get('modalForm').addEventListener('submit', (e) => this.handleFormSubmission(e));
        
        // History filter
        this.elements.get('historyFilter').addEventListener('change', () => this.filterHistory());
        
        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeAllModals());
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    // Optimal Time Complexity: O(1) for real-time updates
    startRealTimeClock() {
        const updateClock = () => {
            const now = new Date();
            const dateOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const timeOptions = {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            
            this.elements.get('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
            this.elements.get('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
            
            // Check for midnight reset
            if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
                this.handleMidnightReset();
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // Mission Management: 14-day cycle with automatic reset
    loadMissionData() {
        const stored = localStorage.getItem(this.storageKeys.currentMission);
        if (stored) {
            const data = JSON.parse(stored);
            // Check if mission is still valid (within 14 days)
            const startDate = new Date(data.startDate);
            const now = new Date();
            const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 14) {
                return data;
            }
        }
        
        // Create new mission
        return this.createNewMission();
    }
    
    createNewMission() {
        const mission = {
            startDate: new Date().toISOString().split('T')[0],
            currentDay: 1,
            dailyTargets: new Array(14).fill(0),
            dailyExpenses: new Array(14).fill(0),
            totalTarget: 0
        };
        this.saveMissionData(mission);
        return mission;
    }
    
    getCurrentDay() {
        const startDate = new Date(this.currentMission.startDate);
        const now = new Date();
        const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        return Math.min(daysDiff + 1, 14);
    }
    
    checkForNewDay() {
        const currentDay = this.getCurrentDay();
        if (currentDay !== this.currentMission.currentDay) {
            this.currentMission.currentDay = currentDay;
            this.saveMissionData(this.currentMission);
            
            if (currentDay > 14) {
                this.currentMission = this.createNewMission();
                this.showToast('New 14-day mission started!', 'success');
            }
        }
    }
    
    handleMidnightReset() {
        this.checkForNewDay();
        this.updateDisplay();
        this.showToast('New day started! Good luck with your financial goals!', 'success');
    }
    
    // Data Persistence: Optimized for fast read/write operations
    loadBalance() {
        return parseFloat(localStorage.getItem(this.storageKeys.balance)) || 0;
    }
    
    saveBalance() {
        localStorage.setItem(this.storageKeys.balance, this.balance.toString());
    }
    
    loadDailyTarget() {
        return parseFloat(localStorage.getItem(this.storageKeys.dailyTarget)) || 0;
    }
    
    saveDailyTarget() {
        localStorage.setItem(this.storageKeys.dailyTarget, this.dailyTarget.toString());
    }
    
    loadTransactions() {
        const stored = localStorage.getItem(this.storageKeys.transactions);
        return stored ? JSON.parse(stored) : [];
    }
    
    saveTransactions() {
        localStorage.setItem(this.storageKeys.transactions, JSON.stringify(this.transactions));
    }
    
    saveMissionData(mission) {
        localStorage.setItem(this.storageKeys.currentMission, JSON.stringify(mission));
    }
    
    autoSave() {
        this.saveBalance();
        this.saveDailyTarget();
        this.saveTransactions();
        this.saveMissionData(this.currentMission);
    }
    
    // Transaction Management: Using efficient data structures
    addTransaction(type, amount, description = '') {
        const transaction = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            type,
            amount: parseFloat(amount),
            description,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
            day: this.getCurrentDay()
        };
        
        // Insert at beginning for O(1) latest transaction access
        this.transactions.unshift(transaction);
        
        // Update balance
        if (type === 'deposit') {
            this.balance += transaction.amount;
        } else if (type === 'withdraw') {
            this.balance -= transaction.amount;
            
            // Update today's expenses
            const today = this.getCurrentDay() - 1;
            if (today >= 0 && today < 14) {
                this.currentMission.dailyExpenses[today] += transaction.amount;
            }
        }
        
        this.saveBalance();
        this.saveTransactions();
        this.saveMissionData(this.currentMission);
        this.updateDisplay();
        
        return transaction;
    }
    
    deleteTransaction(transactionId) {
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
            const transaction = this.transactions[index];
            
            // Reverse the transaction
            if (transaction.type === 'deposit') {
                this.balance -= transaction.amount;
            } else if (transaction.type === 'withdraw') {
                this.balance += transaction.amount;
                
                // Update today's expenses
                const transactionDate = new Date(transaction.timestamp);
                const startDate = new Date(this.currentMission.startDate);
                const dayIndex = Math.floor((transactionDate - startDate) / (1000 * 60 * 60 * 24));
                
                if (dayIndex >= 0 && dayIndex < 14) {
                    this.currentMission.dailyExpenses[dayIndex] -= transaction.amount;
                    this.currentMission.dailyExpenses[dayIndex] = Math.max(0, this.currentMission.dailyExpenses[dayIndex]);
                }
            }
            
            this.transactions.splice(index, 1);
            this.autoSave();
            this.updateDisplay();
            return true;
        }
        return false;
    }
    
    // UI Update Methods: Optimized for minimal DOM manipulation
    updateDisplay() {
        this.updateBalanceDisplay();
        this.updateMissionDisplay();
        this.updateTransactionsList();
        this.updateMissionGrid();
    }
    
    updateBalanceDisplay() {
        const totalBalance = this.elements.get('totalBalance');
        const availableBalance = this.elements.get('availableBalance');
        
        // Animate number changes
        this.animateNumber(totalBalance, this.balance, '৳');
        
        const todaysExpenses = this.getTodaysExpenses();
        const available = Math.max(0, this.dailyTarget - todaysExpenses);
        this.animateNumber(availableBalance, available, '৳');
    }
    
    updateMissionDisplay() {
        const currentDay = this.getCurrentDay();
        this.elements.get('currentDay').textContent = currentDay;
        this.animateNumber(this.elements.get('dailyTargetDisplay'), this.dailyTarget, '৳');
        
        const todaysExpenses = this.getTodaysExpenses();
        this.animateNumber(this.elements.get('todaysExpenses'), todaysExpenses, '৳');
        
        // Update progress bar
        const progress = this.dailyTarget > 0 ? (todaysExpenses / this.dailyTarget) * 100 : 0;
        this.elements.get('expenseProgress').style.width = `${Math.min(progress, 100)}%`;
        
        // Change color based on progress
        const progressBar = this.elements.get('expenseProgress');
        if (progress > 100) {
            progressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (progress > 80) {
            progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
        }
    }
    
    updateTransactionsList() {
        const container = this.elements.get('transactionsList');
        
        if (this.transactions.length === 0) {
            container.innerHTML = '<div class="no-transactions">No transactions yet</div>';
            return;
        }
        
        // Show only recent 5 transactions for performance
        const recentTransactions = this.transactions.slice(0, 5);
        
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">${this.formatTransactionType(transaction.type)}</div>
                    <div class="transaction-time">${this.formatTime(transaction.timestamp)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}৳${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Add click events for transaction management
        container.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showTransactionContextMenu(e, item.dataset.id);
            });
        });
    }
    
    updateMissionGrid() {
        const container = this.elements.get('missionGrid');
        const currentDay = this.getCurrentDay();
        
        let gridHTML = '';
        for (let i = 1; i <= 14; i++) {
            const dayExpenses = this.currentMission.dailyExpenses[i - 1] || 0;
            const dayTarget = this.currentMission.dailyTargets[i - 1] || this.dailyTarget;
            
            let dayClass = 'mission-day';
            let statusText = '';
            
            if (i === currentDay) {
                dayClass += ' current';
                statusText = 'Today';
            } else if (i < currentDay) {
                if (dayExpenses <= dayTarget && dayTarget > 0) {
                    dayClass += ' completed';
                    statusText = '✓';
                } else if (dayExpenses > dayTarget) {
                    dayClass += ' over-budget';
                    statusText = '!';
                } else {
                    statusText = '—';
                }
            } else {
                statusText = 'Future';
            }
            
            gridHTML += `
                <div class="${dayClass}" data-day="${i}">
                    <div class="day-number">Day ${i}</div>
                    <div class="day-status">${statusText}</div>
                </div>
            `;
        }
        
        container.innerHTML = gridHTML;
    }
    
    // Helper Methods
    getTodaysExpenses() {
        const currentDay = this.getCurrentDay() - 1;
        return currentDay >= 0 && currentDay < 14 ? this.currentMission.dailyExpenses[currentDay] : 0;
    }
    
    formatTransactionType(type) {
        return type === 'deposit' ? 'Deposit' : 'Withdraw';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Animation Utilities
    animateNumber(element, targetValue, prefix = '') {
        const startValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
        const difference = targetValue - startValue;
        const duration = 600;
        const steps = 30;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;
        
        let currentValue = startValue;
        let stepCount = 0;
        
        const timer = setInterval(() => {
            stepCount++;
            currentValue += stepValue;
            
            if (stepCount >= steps) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            
            element.textContent = `${prefix}${currentValue.toFixed(2)}`;
        }, stepDuration);
    }
    
    // Modal Management
    showDepositModal() {
        this.showModal('Add Deposit', 'deposit', [
            { name: 'amount', label: 'Amount (৳)', type: 'number', required: true, min: '0.01', step: '0.01' },
            { name: 'description', label: 'Description', type: 'text', required: false }
        ]);
    }
    
    showWithdrawModal() {
        this.showModal('Record Expense', 'withdraw', [
            { name: 'amount', label: 'Amount (৳)', type: 'number', required: true, min: '0.01', step: '0.01', max: this.balance },
            { name: 'description', label: 'Description', type: 'text', required: false }
        ]);
    }
    
    showTargetModal() {
        this.showModal('Set Daily Target', 'target', [
            { name: 'target', label: 'Daily Target (৳)', type: 'number', required: true, min: '0.01', step: '0.01', value: this.dailyTarget }
        ]);
    }
    
    showModal(title, type, fields) {
        this.elements.get('modalTitle').textContent = title;
        this.elements.get('modalForm').dataset.type = type;
        
        const fieldsHTML = fields.map(field => `
            <div class="form-group">
                <label class="form-label" for="${field.name}">${field.label}</label>
                <input 
                    class="form-input" 
                    type="${field.type}" 
                    id="${field.name}" 
                    name="${field.name}"
                    ${field.required ? 'required' : ''}
                    ${field.min ? `min="${field.min}"` : ''}
                    ${field.max ? `max="${field.max}"` : ''}
                    ${field.step ? `step="${field.step}"` : ''}
                    ${field.value ? `value="${field.value}"` : ''}
                    placeholder="${field.label}"
                    autocomplete="off"
                >
            </div>
        `).join('');
        
        this.elements.get('formFields').innerHTML = fieldsHTML;
        this.elements.get('modal').classList.add('active');
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.elements.get('formFields').querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    showHistoryModal() {
        this.elements.get('historyModal').classList.add('active');
        this.renderHistory();
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        this.elements.get('modalForm').reset();
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    handleFormSubmission(e) {
        e.preventDefault();
        
        this.showLoading();
        
        // Simulate processing time for better UX
        setTimeout(() => {
            const formData = new FormData(e.target);
            const type = e.target.dataset.type;
            
            try {
                switch (type) {
                    case 'deposit':
                        this.handleDeposit(formData);
                        break;
                    case 'withdraw':
                        this.handleWithdraw(formData);
                        break;
                    case 'target':
                        this.handleTargetUpdate(formData);
                        break;
                }
                
                this.closeAllModals();
                this.hideLoading();
            } catch (error) {
                this.hideLoading();
                this.showToast(error.message, 'error');
            }
        }, 300);
    }
    
    handleDeposit(formData) {
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Deposit';
        
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        
        this.addTransaction('deposit', amount, description);
        this.showToast(`৳${amount.toFixed(2)} deposited successfully!`, 'success');
    }
    
    handleWithdraw(formData) {
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Expense';
        
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        
        if (amount > this.balance) {
            throw new Error('Insufficient balance');
        }
        
        this.addTransaction('withdraw', amount, description);
        this.showToast(`৳${amount.toFixed(2)} expense recorded!`, 'success');
    }
    
    handleTargetUpdate(formData) {
        const target = parseFloat(formData.get('target'));
        
        if (target <= 0) {
            throw new Error('Target must be greater than 0');
        }
        
        this.dailyTarget = target;
        
        // Update current mission targets
        for (let i = this.getCurrentDay() - 1; i < 14; i++) {
            this.currentMission.dailyTargets[i] = target;
        }
        
        this.saveDailyTarget();
        this.saveMissionData(this.currentMission);
        this.updateDisplay();
        this.showToast(`Daily target set to ৳${target.toFixed(2)}!`, 'success');
    }
    
    // History Management: Efficient filtering with O(n) complexity
    renderHistory(filter = 'all') {
        const container = this.elements.get('historyList');
        let filteredTransactions = this.transactions;
        
        // Apply filters
        const now = new Date();
        const today = now.toDateString();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        switch (filter) {
            case 'deposit':
                filteredTransactions = this.transactions.filter(t => t.type === 'deposit');
                break;
            case 'withdraw':
                filteredTransactions = this.transactions.filter(t => t.type === 'withdraw');
                break;
            case 'today':
                filteredTransactions = this.transactions.filter(t => t.date === today);
                break;
            case 'week':
                filteredTransactions = this.transactions.filter(t => new Date(t.timestamp) >= weekStart);
                break;
            case 'month':
                filteredTransactions = this.transactions.filter(t => new Date(t.timestamp) >= monthStart);
                break;
        }
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = '<div class="no-transactions">No transactions found</div>';
            return;
        }
        
        container.innerHTML = filteredTransactions.map(transaction => `
            <div class="history-item" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">${this.formatTransactionType(transaction.type)}</div>
                    <div class="transaction-time">${this.formatTime(transaction.timestamp)}</div>
                    ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}৳${transaction.amount.toFixed(2)}
                </div>
                <button class="delete-transaction" onclick="tracker.deleteTransactionConfirm('${transaction.id}')">×</button>
            </div>
        `).join('');
    }
    
    filterHistory() {
        const filter = this.elements.get('historyFilter').value;
        this.renderHistory(filter);
    }
    
    deleteTransactionConfirm(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            if (this.deleteTransaction(transactionId)) {
                this.showToast('Transaction deleted successfully!', 'success');
                this.renderHistory(this.elements.get('historyFilter').value);
            } else {
                this.showToast('Failed to delete transaction!', 'error');
            }
        }
    }
    
    // Context Menu for transactions
    showTransactionContextMenu(e, transactionId) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 0.5rem 0;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
        `;
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="tracker.deleteTransactionConfirm('${transactionId}')">Delete Transaction</div>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Remove context menu on click outside
        const removeContextMenu = () => {
            if (contextMenu.parentNode) {
                contextMenu.parentNode.removeChild(contextMenu);
            }
            document.removeEventListener('click', removeContextMenu);
        };
        
        setTimeout(() => document.addEventListener('click', removeContextMenu), 0);
    }
    
    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'd':
                    e.preventDefault();
                    this.showDepositModal();
                    break;
                case 'w':
                    e.preventDefault();
                    this.showWithdrawModal();
                    break;
                case 't':
                    e.preventDefault();
                    this.showTargetModal();
                    break;
                case 'h':
                    e.preventDefault();
                    this.showHistoryModal();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }
    
    // Loading and Toast Utilities
    showLoading() {
        this.elements.get('loading').classList.add('active');
    }
    
    hideLoading() {
        this.elements.get('loading').classList.remove('active');
    }
    
    showToast(message, type = 'success') {
        const toast = this.elements.get('toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Data Export/Import (Bonus Feature)
    exportData() {
        const data = {
            balance: this.balance,
            dailyTarget: this.dailyTarget,
            transactions: this.transactions,
            currentMission: this.currentMission,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }
    
    importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (data.balance !== undefined && data.transactions && data.currentMission) {
                    this.balance = data.balance;
                    this.dailyTarget = data.dailyTarget || 0;
                    this.transactions = data.transactions;
                    this.currentMission = data.currentMission;
                    
                    this.autoSave();
                    this.updateDisplay();
                    this.showToast('Data imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showToast('Failed to import data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
let tracker;

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tracker = new FinancialTracker();
    });
} else {
    tracker = new FinancialTracker();
}

// Service Worker Registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add styles for context menu
const contextMenuStyles = `
    .context-menu {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.5rem 0;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
    }
    
    .context-menu-item {
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: var(--transition);
        font-size: 0.875rem;
    }
    
    .context-menu-item:hover {
        background: #f1f5f9;
        color: var(--danger-color);
    }
    
    .delete-transaction {
        background: var(--danger-color);
        color: white;
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-weight: bold;
        transition: var(--transition);
    }
    
    .delete-transaction:hover {
        background: #dc2626;
        transform: scale(1.1);
    }
    
    .transaction-description {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-style: italic;
    }
`;

// Inject additional styles
const styleElement = document.createElement('style');
styleElement.textContent = contextMenuStyles;
document.head.appendChild(styleElement);