"use client"

import { useAuth } from "@/lib/auth-context";
import { Bell, Search, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeToNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        // Public VAPID key placeholder - in a real app this would be in env vars
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: 'BEl62vp9IHZbtas_x1Gq5G8YF0hy4S8iL7E6fQ1nFpX' // Placeholder key
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);
        
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, userId: user?.id })
        });
        
        setIsSubscribed(true);
        alert("تم تفعيل الإشعارات بنجاح!");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: "بلاغ جديد", desc: "تم استلام بلاغ بخصوص تسرب مياه", time: "منذ دقيقتين", unread: true },
    { id: 2, title: "تحديث الحالة", desc: "تم تغيير حالة بلاغك إلى 'جاري التنفيذ'", time: "منذ ساعة", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search / Breadcrumbs placeholder */}
      <div className="hidden md:flex items-center gap-2 text-muted-foreground">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            type="text" 
            placeholder="البحث في البلاغات..." 
            className="h-9 pr-9 pl-4 rounded-lg bg-background border border-border text-xs focus:ring-2 focus:ring-primary/10 transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Push Notification Toggle */}
        <button 
          onClick={subscribeToNotifications}
          disabled={isSubscribed || isSubscribing}
          title="تفعيل إشعارات الهاتف"
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
            isSubscribed 
              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
              : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary/30"
          )}
        >
          {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : <Bell size={20} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all relative group"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 left-2 w-2.5 h-2.5 bg-red-500 border-2 border-surface rounded-full group-hover:scale-125 transition-transform" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute left-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-black">الإشعارات</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">جديد ({unreadCount})</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <Link 
                      key={n.id} 
                      href={user?.role === 'citizen' ? '/dashboard/tracking' : '/dashboard/admin'}
                      onClick={() => setShowNotifications(false)}
                      className={cn("block p-4 hover:bg-background transition-colors cursor-pointer border-b border-border last:border-0", n.unread && "bg-primary/[0.02]")}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-foreground">{n.title}</span>
                        <span className="text-[9px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{n.desc}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/dashboard/notifications" className="block text-center p-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
                  عرض كافة الإشعارات
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-xl bg-background border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
              {user?.full_name?.charAt(0)}
            </div>
            <span className="text-xs font-black hidden sm:block">{user?.full_name?.split(' ')[0]}</span>
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
              <div className="absolute left-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-border bg-primary-50/30">
                  <p className="text-xs font-black">{user?.full_name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-0.5 capitalize">{user?.role}</p>
                </div>
                <div className="p-2">
                  <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-background hover:text-foreground transition-all">
                    <UserIcon size={16} />
                    <span>الملف الشخصي</span>
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all w-full">
                    <LogOut size={16} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
