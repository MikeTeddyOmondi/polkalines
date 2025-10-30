<script lang="ts">
	import { onMount } from 'svelte';
	import { createProject, listProjects, triggerPipeline } from '$lib/remote/api';
	import type { Project, Pipeline } from '$lib/remote/api';
	import PipelineCard from '$lib/components/PipelineCard.svelte';
	import CreateProjectModal from '$lib/components/CreateProjectModal.svelte';

	let projects: Project[] = [];
	let pipelines: Record<string, Pipeline> = {};
	let loading = true;
	let error: string | null = null;
	let showCreateModal = false;

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

	async function handleCreateProject(
		event: CustomEvent<{ project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> }>
	) {
		try {
			const newProject = await createProject(event.detail.project);
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

<main class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<button
			on:click={() => (showCreateModal = true)}
			class="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
		>
			Create New Project
		</button>
	</div>

	{#if error}
		<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
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
					<div class="rounded-lg bg-white p-6 shadow">
						<div class="mb-4 flex items-center justify-between">
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
								class="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

	<CreateProjectModal
		bind:show={showCreateModal}
		on:close={() => (showCreateModal = false)}
		on:submit={handleCreateProject}
	/>
</main>
