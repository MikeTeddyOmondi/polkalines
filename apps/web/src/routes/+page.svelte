<script lang="ts">
  import { onMount } from 'svelte';
  import { createProject, listProjects, triggerPipeline } from '$lib/remote/api';
  import type { Project, Pipeline } from '$lib/remote/api';
  import PipelineCard from '$lib/components/PipelineCard.svelte';

  let projects: Project[] = [];
  let pipelines: Record<string, Pipeline> = {};
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      projects = await listProjects();
    } catch (e) {
      error = 'Failed to load projects';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  async function handleCreateProject(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const project = await createProject({
        name: formData.get('name') as string,
        repoUrl: formData.get('repoUrl') as string,
        type: formData.get('type') as 'ink-contract' | 'dapp',
        framework: formData.get('framework') as string,
      });

      projects = [...projects, project];
      form.reset();
    } catch (e) {
      error = 'Failed to create project';
      console.error(e);
    }
  }

  async function handleTriggerPipeline(project: Project) {
    try {
      const pipeline = await triggerPipeline(project.id);
      pipelines = { ...pipelines, [project.id]: pipeline };
    } catch (e) {
      error = 'Failed to trigger pipeline';
      console.error(e);
    }
  }
</script>

<main class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Console</h1>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <section class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">Create New Project</h2>
    <form on:submit={handleCreateProject} class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          type="text"
          name="name"
          id="name"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="repoUrl" class="block text-sm font-medium text-gray-700">Repository URL</label>
        <input
          type="url"
          name="repoUrl"
          id="repoUrl"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="type" class="block text-sm font-medium text-gray-700">Project Type</label>
        <select
          name="type"
          id="type"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select Type</option>
          <option value="ink-contract">ink! Contract</option>
          <option value="dapp">dApp</option>
        </select>
      </div>

      <div>
        <label for="framework" class="block text-sm font-medium text-gray-700">Framework (for dApps)</label>
        <select
          name="framework"
          id="framework"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select Framework</option>
          <option value="vite">Vite</option>
          <option value="nextjs">Next.js</option>
          <option value="svelte">SvelteKit</option>
        </select>
      </div>

      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Project
      </button>
    </form>
  </section>

  <section>
    <h2 class="text-2xl font-semibold mb-4">Projects</h2>
    {#if loading}
      <p>Loading projects...</p>
    {:else if projects.length === 0}
      <p class="text-gray-500">No projects yet. Create one above!</p>
    {:else}
      <div class="space-y-4">
        {#each projects as project (project.id)}
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold">{project.name}</h3>
                <p class="text-sm text-gray-500">{project.repoUrl}</p>
                <p class="text-sm text-gray-500">
                  Type: {project.type}
                  {#if project.framework}
                    | Framework: {project.framework}
                  {/if}
                </p>
              </div>
              <button
                on:click={() => handleTriggerPipeline(project)}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Run Pipeline
              </button>
            </div>

            {#if pipelines[project.id]}
              <PipelineCard pipeline={pipelines[project.id]} {project} />
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</main>
