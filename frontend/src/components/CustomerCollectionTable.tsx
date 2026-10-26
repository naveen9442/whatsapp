import React from 'react';
import toast from 'react-hot-toast';

export interface CustomerRow {
  id: string;
  name: string;
  company: string;
  phone: string;
  amountDue: number | null;
  propensityScore: number;
  propensityLevel: 'High' | 'Medium' | 'Low';
  lastReply: string;
}

interface CustomerCollectionTableProps {
  onRemind?: (customer: CustomerRow) => void;
}

export const DEMO_CUSTOMERS: CustomerRow[] = [
  {
    id: 'cust_1',
    name: 'Priya Nair',
    company: 'Northwind Foods',
    phone: '+91 98765 43210',
    amountDue: 24900,
    propensityScore: 95,
    propensityLevel: 'High',
    lastReply: 'Oct 20, 08:48 AM',
  },
  {
    id: 'cust_2',
    name: 'Ananya Sharma',
    company: 'Lumen Health Clinics',
    phone: '+91 98765 43211',
    amountDue: 24900,
    propensityScore: 27,
    propensityLevel: 'Low',
    lastReply: 'No reply yet',
  },
  {
    id: 'cust_3',
    name: 'Tanmay Kulkarni',
    company: 'Kestrel Logistics',
    phone: '+91 98765 43212',
    amountDue: 9900,
    propensityScore: 80,
    propensityLevel: 'High',
    lastReply: 'Oct 20, 12:48 PM',
  },
  {
    id: 'cust_4',
    name: 'Devika Rao',
    company: 'Freelance Design',
    phone: '+91 98765 43213',
    amountDue: 2900,
    propensityScore: 57,
    propensityLevel: 'Medium',
    lastReply: 'Oct 21, 07:48 AM',
  },
  {
    id: 'cust_5',
    name: 'Manish Verma',
    company: 'Verma & Sons Enterprises',
    phone: '+91 98765 43214',
    amountDue: null,
    propensityScore: 95,
    propensityLevel: 'High',
    lastReply: 'Oct 17, 10:48 AM',
  },
];

export const CustomerCollectionTable: React.FC<CustomerCollectionTableProps> = ({
  onRemind,
}) => {
  const getPropensityBadge = (level: string, score: number) => {
    switch (level) {
      case 'High':
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200',
          bar: 'bg-blue-600',
        };
      case 'Low':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          bar: 'bg-rose-500',
        };
      case 'Medium':
      default:
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200',
          bar: 'bg-amber-600',
        };
    }
  };

  const handleRemindClick = (customer: CustomerRow) => {
    if (onRemind) {
      onRemind(customer);
    } else {
      toast.success(`WhatsApp reminder queued for ${customer.name}`);
    }
  };

  return (
    <div className="crm-card overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Customer collection & payment propensity
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            AI-predicted likelihood to settle dues via WhatsApp
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium">
              <th className="py-3 px-6 font-semibold">Customer</th>
              <th className="py-3 px-6 font-semibold">Amount due</th>
              <th className="py-3 px-6 font-semibold min-w-[200px]">
                Payment propensity
              </th>
              <th className="py-3 px-6 font-semibold">Last reply</th>
              <th className="py-3 px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {DEMO_CUSTOMERS.map((row) => {
              const styles = getPropensityBadge(
                row.propensityLevel,
                row.propensityScore
              );
              return (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-bold text-gray-900 text-xs">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {row.company}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-mono font-semibold text-gray-900 text-xs">
                    {row.amountDue != null ? (
                      `₹${row.amountDue.toLocaleString()}`
                    ) : (
                      <span className="text-gray-400 font-normal">—</span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-1.5 max-w-[170px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles.pill}`}
                      >
                        {row.propensityLevel} · {row.propensityScore}%
                      </span>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${styles.bar}`}
                          style={{ width: `${row.propensityScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-gray-600 text-xs font-medium">
                    {row.lastReply}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleRemindClick(row)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors shadow-sm"
                    >
                      Remind
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerCollectionTable;
