<script lang="ts">
	import { createProject, listProjects, triggerPipeline } from '$lib/remote/api';
	import type { Project, Pipeline } from '$lib/remote/api';
	import PipelineCard from '$lib/components/PipelineCard.svelte';
	import CreateProjectModal from '$lib/components/CreateProjectModal.svelte';
	import { Zap, FolderPlus } from 'lucide-svelte';

	let projects = $state<Project[]>([]);
	let pipelines = $state<Record<string, Pipeline>>({});
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showCreateModal = $state(false);

	$effect(() => {
		loadProjects();
	});

	async function loadProjects() {
		try {
			projects = await listProjects();
		} catch (e) {
			error = 'Failed to load projects';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function handleCreateProject(event: {
		project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
	}) {
		try {
			const newProject = await createProject(event.project);
			projects = [...projects, newProject];
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

<main class="container p-6 mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<button
			onclick={() => (showCreateModal = true)}
			class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
		>
			<FolderPlus class="mr-2" />
			<span> Add Project </span>
		</button>
	</div>

	{#if error}
		<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
			{error}
		</div>
	{/if}

	<section>
		<h2 class="mb-4 text-2xl font-semibold">Projects</h2>
		{#if loading}
			<p>Loading projects...</p>
		{:else if projects.length === 0}
			<p class="text-gray-500">No projects yet. Click "Create Project" to get started!</p>
		{:else}
			<div class="space-y-4">
				{#each projects as project (project.id)}
					<div class="p-6 bg-white rounded-lg shadow">
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
								onclick={() => handleTriggerPipeline(project)}
								class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-500 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
							>
								<Zap class="mr-2" />
								<span>Run Pipeline</span>
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

	<CreateProjectModal
		bind:show={showCreateModal}
		onclose={() => (showCreateModal = false)}
		onsubmit={handleCreateProject}
	/>
</main>