/** Collects teardown actions for entities created during a test; runs them LIFO. */
export class CleanupRegistry {
  private readonly tasks: { label: string; run: () => Promise<unknown> }[] = [];

  register(label: string, run: () => Promise<unknown>) {
    this.tasks.push({ label, run });
  }

  /** Runs every task even if some fail, then throws one error listing all failures. */
  async runAll() {
    const failures: string[] = [];
    for (const { label, run } of this.tasks.reverse()) {
      try {
        await run();
      } catch (e) {
        failures.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    this.tasks.length = 0;
    if (failures.length) throw new Error(`Cleanup failed:\n${failures.join('\n')}`);
  }
}
