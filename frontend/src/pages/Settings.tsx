import { useState } from 'react';
import { 
  Shield, 
  Globe, Moon, CreditCard, 
  ChevronRight,
  Mail, Phone, Lock
} from 'lucide-react';
import Layout from '../components/layout/Layout';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: Mail, label: 'Email Address', value: 'alex@voyager.com' },
        { icon: Phone, label: 'Phone Number', value: '+1 (555) 123-4567' },
        { icon: Lock, label: 'Password', value: '••••••••' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', value: 'English (US)' },
        { icon: CreditCard, label: 'Currency', value: 'USD ($)' },
        { icon: Moon, label: 'Dark Mode', type: 'toggle', value: darkMode, setter: setDarkMode },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Session Security', value: 'JWT with refresh token rotation' },
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl space-y-10 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your account preferences and security.</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-border">
              <div className="px-10 py-6 bg-muted/50 border-b border-border">
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest">{section.title}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {section.items.map((item, idx) => (
                  <div key={idx} className="px-10 py-8 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-card transition-colors">
                        <item.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">{item.label}</p>
                        {item.type !== 'toggle' && (
                          <p className="text-sm text-muted-foreground font-medium">{item.value as string}</p>
                        )}
                      </div>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <button 
                        onClick={() => item.setter?.(!item.value)}
                        className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
                          item.value ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-card rounded-full transition-transform duration-300 ${
                          item.value ? 'translate-x-6' : ''
                        }`} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Edit</button>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
