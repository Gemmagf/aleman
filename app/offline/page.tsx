export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-16 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Sense connexió</h1>
        <p className="mt-2 text-sm text-neutral-500">
          No tens internet ara mateix. Pots tornar a la lliçó d'avui si ja
          l'havies obert: la guardem en cau perquè la puguis escoltar offline.
        </p>
        <a
          href="/today"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Tornar a Avui
        </a>
      </div>
    </main>
  );
}
