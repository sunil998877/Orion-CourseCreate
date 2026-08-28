import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Search } from 'lucide-react';
import { getAdminCourses } from '../services/adminService';
import { cn } from '../lib/utils';
export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAdminCourses(search);
            setCourses(res.courses || []);
        }
        catch (err: any) {
            console.error('Failed to load courses:', err);
            setError(err.message || 'Failed to load courses from database');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);
    return (<div className="space-y-8 transition-colors duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
              <BookOpen className="h-3.5 w-3.5"/>
              LIVE DATABASE COURSES
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Generated Courses & AI Jobs
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/60">
            Track user-generated courses, slide deck links, podcasts, and active generation status directly from MongoDB.
          </p>
        </div>

        <button onClick={fetchCourses} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")}/>
          Refresh Courses
        </button>
      </div>

      {error && (<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Notice: {error}
        </div>)}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-white/40"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by course title or ID..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-white/40 dark:focus:border-lime-400"/>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                <th className="px-6 py-4 font-semibold">Content Title</th>
                <th className="px-6 py-4 font-semibold">Creator</th>
                <th className="px-6 py-4 font-semibold">Modules</th>
                <th className="px-6 py-4 font-semibold">AI Features</th>
                <th className="px-6 py-4 text-right font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {courses.length > 0 ? (courses.map((course: any) => (<tr key={course.id || course.courseId} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{course.title || "Untitled Course"}</div>
                      <div className="font-mono text-[11px] text-slate-400 dark:text-white/40">{course.courseId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {course.user?.username || course.user?.email || "User"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-white/10 dark:text-white/80">
                        {course.moduleCount || course.modulesOverview?.length || 0} Modules
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {course.podcastStatus === "completed" && (<span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Podcast Ready
                          </span>)}
                        {course.ebookStatus === "completed" && (<span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Ebook Ready
                          </span>)}
                        {course.modulesOverview?.some((m: any) => m.gammaUrl) && (<span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Slides Ready
                          </span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                  </tr>))) : (<tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {loading ? "Loading courses from MongoDB..." : "No courses found."}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
