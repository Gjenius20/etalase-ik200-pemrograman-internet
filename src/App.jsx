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
  const [selectedLevel, setSelectedLevel] = useState('Semua');
  const [selectedProject, setSelectedProject] = useState(null);

  const levelCounts = useMemo(() => {
    const counts = { Semua: projectsData.length, SD: 0, SMP: 0, SMA: 0, SMK: 0 };
    projectsData.forEach((item) => {
      if (counts[item.level] !== undefined) {
        counts[item.level] += 1;
      }
    });
    return counts;
  }, []);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projectsData.filter((project) => {
      const matchesLevel =
        selectedLevel === 'Semua' || project.level === selectedLevel;
      if (!matchesLevel) return false;

      if (!query) return true;

      const searchableText = [
        project.appName,
        project.groupName,
        project.shortDescription,
        project.fullDescription,
        project.level,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, selectedLevel]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('Semua');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar totalProjects={projectsData.length} />

      <main className="flex-1">
        <HeroSection />

        <section
          id="katalog"
          aria-labelledby="katalog-heading"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
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
            <p className="text-sm font-semibold text-slate-600">
              Menampilkan {filteredProjects.length} dari {projectsData.length} proyek
            </p>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            levelCounts={levelCounts}
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
                Pencarian &ldquo;{searchQuery}&rdquo; pada jenjang {selectedLevel} tidak menemukan aplikasi. Coba ubah kata kunci atau reset filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#01875F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#016e4d]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset Pencarian &amp; Filter
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
