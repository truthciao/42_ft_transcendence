import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '@/lib/confirm-context';

// --- 评测数据结构（分类与原文） ---
const EVAL_CATEGORIES = [
  {
    title: 'IV.1 Web',
    modules: [
      {
        id: 'web-framework',
        type: 'Major',
        points: 2,
        link: null,
        rawText: `- Major: Use a framework for both the frontend and backend.\n    ◦ Use a frontend framework (React, Vue, Angular, Svelte, etc.).\n    ◦ Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails, etc.).\n    ◦ Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use both their frontend and backend capabilities.`,
      },
      {
        id: 'web-realtime',
        type: 'Major',
        points: 2,
        link: null, // 全局WebSocket，无特定页面
        rawText: `- Major: Implement real-time features using WebSockets or similar technology.\n    ◦ Real-time updates across clients.\n    ◦ Handle connection/disconnection gracefully.\n    ◦ Efficient message broadcasting.`,
      },
      {
        id: 'web-interact',
        type: 'Major',
        points: 2,
        link: '/app/chat',
        rawText: `- Major: Allow users to interact with other users. The minimum requirements are:\n    ◦ A basic chat system (send/receive messages between users).\n    ◦ A profile system (view user information).\n    ◦ A friends system (add/remove friends, see friends list).`,
      },
      {
        id: 'web-orm',
        type: 'Minor',
        points: 1,
        link: null,
        rawText: `• Minor: Use an ORM for the database.`,
      },
      {
        id: 'web-notifications',
        type: 'Minor',
        points: 1,
        link: '/app/settings/notifications',
        rawText: `• Minor: A complete notification system for all creation, update, and deletion actions.`,
      },
      {
        id: 'web-collab',
        type: 'Minor',
        points: 1,
        link: '/app/spaces',
        rawText: `- Minor: Real-time collaborative features (shared workspaces, live editing, collaborative drawing, etc.).`,
      },
      {
        id: 'web-design',
        type: 'Minor',
        points: 1,
        link: '/showcase', // 可链接到你们的组件展示页
        rawText: `- Minor: Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components).`,
      },
    ],
  },
  {
    title: 'IV.2 Accessibility and Internationalization',
    modules: [
      {
        id: 'a11y-i18n',
        type: 'Minor',
        points: 1,
        link: '/app/settings/profile',
        rawText: `- Minor: Support for multiple languages (at least 3 languages).\n    ◦ Implement i18n (internationalization) system.\n    ◦ At least 3 complete language translations.\n    ◦ Language switcher in the UI.\n    ◦ All user-facing text must be translatable.`,
      },
      {
        id: 'a11y-browsers',
        type: 'Minor',
        points: 1,
        link: null,
        rawText: `- Minor: Support for additional browsers.\n    ◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).\n    ◦ Test and fix all features in each browser.\n    ◦ Document any browser-specific limitations.\n    ◦ Consistent UI/UX across all supported browsers.`,
      },
    ],
  },
  {
    title: 'IV.3 User Management',
    modules: [
      {
        id: 'um-standard',
        type: 'Major',
        points: 2,
        link: '/app/settings/profile',
        rawText: `- Major: Standard user management and authentication.\n    ◦ Users can update their profile information.\n    ◦ Users can upload an avatar (with a default avatar if none provided).\n    ◦ Users can add other users as friends and see their online status.\n    ◦ Users have a profile page displaying their information.`,
      },
      {
        id: 'um-permissions',
        type: 'Major',
        points: 2,
        link: '/app/spaces',
        rawText: `- Major: Advanced permissions system:\n    ◦ View, edit, and delete users (CRUD).\n    ◦ Roles management (admin, user, guest, moderator, etc.).\n    ◦ Different views and actions based on user role.`,
      },
      {
        id: 'um-organizations',
        type: 'Major',
        points: 2,
        link: '/app/spaces',
        rawText: `- Major: An organization system:\n    ◦ Create, edit, and delete organizations.\n    ◦ Add users to organizations.\n    ◦ Remove users from organizations.\n    ◦ View organizations and allow users to perform specific actions within an organization (minimum: create, read, update).`,
      },
      {
        id: 'um-oauth',
        type: 'Minor',
        points: 1,
        link: '/login',
        rawText: `• Minor: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).`,
      },
      {
        id: 'um-2fa',
        type: 'Minor',
        points: 1,
        link: '/app/settings/account',
        rawText: `• Minor: Implement a complete 2FA (Two-Factor Authentication) system for the users.`,
      },
    ],
  },
];

export function EvaluationPage() {
  const navigate = useNavigate();

  const confirm = useConfirm();
  const { t } = useTranslation();

  // 从 localStorage 读取分数，防止页面跳转后丢失
  const [passed, setPassed] = useState<string[]>(() => {
    const saved = localStorage.getItem('transcendence_eval');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transcendence_eval', JSON.stringify(passed));
  }, [passed]);

  const toggleModule = (id: string) => {
    setPassed((prev) =>
      prev.includes(id) ? prev.filter((modId) => modId !== id) : [...prev, id],
    );
  };

  const clearScores = async () => {
    const confirmed = await confirm({
      title: t('evaluation.resetConfirm'),
    });

    if (confirmed) {
      setPassed([]);
    }
  };

  // 动态计算分数
  const maxScore = 20;
  let currentScore = 0;
  EVAL_CATEGORIES.forEach((cat) => {
    cat.modules.forEach((mod) => {
      if (passed.includes(mod.id)) currentScore += mod.points;
    });
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      {/* 顶部固定计分板 */}
      <div className="sticky top-4 z-50 bg-card border border-border shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('evaluation.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('evaluation.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Button variant="outline" onClick={clearScores}>
            {t('evaluation.reset')}
          </Button>
          <div className="text-right">
            <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              {t('evaluation.totalScore')}
            </div>
            <div
              className={`text-4xl font-black ${currentScore === maxScore ? 'text-green-500' : 'text-primary'}`}
            >
              {currentScore}{' '}
              <span className="text-2xl text-muted-foreground font-normal">
                / {maxScore} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 分类循环渲染 */}
      <div className="space-y-12">
        {EVAL_CATEGORIES.map((category, catIdx) => (
          <section key={catIdx}>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border text-foreground">
              {t(`evaluation.categories.${catIdx}.title`, {
                defaultValue: category.title,
              })}
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {category.modules.map((mod) => {
                const isPassed = passed.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`flex flex-col border rounded-xl p-5 transition-colors ${
                      isPassed
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex gap-3 items-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                            mod.type === 'Major'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {t(`evaluation.moduleType.${mod.type.toLowerCase()}`)}{' '}
                          ({mod.points} {t('evaluation.pointsShort')})
                        </span>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer bg-background border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        <input
                          type="checkbox"
                          className="w-5 h-5 cursor-pointer accent-primary"
                          checked={isPassed}
                          onChange={() => toggleModule(mod.id)}
                        />
                        <span className="text-sm font-semibold select-none">
                          {isPassed
                            ? t('evaluation.passed')
                            : t('evaluation.verify')}
                        </span>
                      </label>
                    </div>

                    {/* 显示原文，保留缩进和换行 */}
                    <div className="mb-6 flex-grow">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50">
                        {t(`evaluation.modules.${mod.id}.rawText`, {
                          defaultValue: mod.rawText,
                        })}
                      </pre>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50">
                      {mod.link ? (
                        <Button
                          variant={isPassed ? 'secondary' : 'default'}
                          className="w-full"
                          onClick={() => navigate(mod.link!)}
                        >
                          {t('evaluation.launchDemo', { link: mod.link })}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          disabled
                          className="w-full opacity-50"
                        >
                          {t('evaluation.architectureNote')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
