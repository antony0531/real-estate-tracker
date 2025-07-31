import React, { useState } from 'react';
import { Plus, X, DollarSign, Camera, FileText } from 'lucide-react';
import { QuickExpenseModal } from './QuickExpenseModal';

export function QuickAddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const quickActions = [
    {
      icon: DollarSign,
      label: 'Add Expense',
      color: 'bg-green-500',
      action: () => {
        setShowExpenseModal(true);
        setIsOpen(false);
      }
    },
    {
      icon: Camera,
      label: 'Scan Receipt',
      color: 'bg-blue-500',
      action: () => {
        // TODO: Open camera
        console.log('Scan receipt');
        setIsOpen(false);
      }
    },
    {
      icon: FileText,
      label: 'Add Note',
      color: 'bg-purple-500',
      action: () => {
        // TODO: Open note modal
        console.log('Add note');
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Actions */}
      <div className={`fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 transition-all duration-300 md:hidden ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex items-center gap-3 bg-white rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
          >
            <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center text-white`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 w-14 h-14 bg-primary-500 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all duration-300 z-50 md:hidden ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Quick Expense Modal */}
      <QuickExpenseModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
    </>
  );
}