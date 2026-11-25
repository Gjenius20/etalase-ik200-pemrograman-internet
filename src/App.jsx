import { useMemo, useState } from 'react';
import { RotateCcw, SearchX } from 'lucide-react';
import projectsData from './data/projects.json';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FilterBar from './components/FilterBar';
import AppCard from './components/AppCard';
import ProjectDetailModal from './components/ProjectDetailModal';
import Footer from './components/Footer';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projectsData;

    return projectsData.filter((project) => {
      const searchableText = [
        project.appName,
        project.groupName,
        project.shortDescription,
        project.fullDescription,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery]);

  const handleResetSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F7F3] text-[#111920]">
      <Navbar totalProjects={projectsData.length} />

      <main className="flex-1">
        <HeroSection />

        <section
          id="katalog"
          aria-labelledby="katalog-heading"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mb-6">
            <h2
              id="katalog-heading"
              className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
            >
              Etalase Aplikasi Pembelajaran
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Pilih kartu aplikasi untuk melihat detail, demo video, screenshot, dan dokumen proyek.
            </p>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredCount={filteredProjects.length}
            totalCount={projectsData.length}
          />

          {filteredProjects.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <AppCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Tidak ada proyek yang cocok
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Pencarian &ldquo;{searchQuery}&rdquo; tidak menemukan aplikasi. Coba ubah kata kunci atau reset pencarian.
              </p>
              <button
                type="button"
                onClick={handleResetSearch}
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#235334] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a3f27]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset Pencarian
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
