<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Project, Pipeline } from '$lib/remote/api';
	import { getPipelineStatus, getPipelineLogs } from '$lib/remote/api';

	interface PipelineCardProps {
		pipeline: Pipeline;
		project: Project;
	}

	let { pipeline, project }: PipelineCardProps = $props();

	// Create a local state copy that can be updated
	let currentPipeline = $state<Pipeline>(pipeline);
	let logs = $state<string[]>([]);
	let intervalId: NodeJS.Timeout;

	// Sync when pipeline prop changes
	$effect(() => {
		currentPipeline = pipeline;
	});

	async function updateStatus() {
		try {
			// Use the original pipeline.pipelineId which never changes
			const updatedPipeline = await getPipelineStatus(pipeline.pipelineId);
			
			// Update the local state copy
			currentPipeline = updatedPipeline;
			
			console.log({ originalPipeline: pipeline, updatedPipeline, currentPipeline });

			// Use the updated pipeline's id for logs
			const logsResponse = await getPipelineLogs(updatedPipeline.id);
			logsResponse.logs === "" 
				? logs = []
				: logs = [...logs, logsResponse.logs];

			if (updatedPipeline.status === 'success' || updatedPipeline.status === 'failed') {
				clearInterval(intervalId);
			}
		} catch (error) {
			console.error('Error updating pipeline status:', error);
		}
	}

	let statusColor = $derived(
		{
			pending: 'bg-yellow-100 text-yellow-800',
			running: 'bg-blue-100 text-blue-800',
			success: 'bg-green-100 text-green-800',
			failed: 'bg-red-100 text-red-800'
		}[currentPipeline.status]
	);

	// Poll for updates every 2 seconds
	intervalId = setInterval(updateStatus, 2000);

	onDestroy(() => {
		clearInterval(intervalId);
	});
</script>

<div class="p-6 mb-4 bg-white rounded-lg shadow">
	<div class="flex items-center justify-between mb-4">
		<div>
			<h3 class="text-lg font-semibold">{project.name}</h3>
			<p class="text-sm text-gray-500">Pipeline ID: {currentPipeline.id}</p>
		</div>
		<span class="rounded-full px-3 py-1 text-sm font-medium {statusColor}">
			{currentPipeline.status}
		</span>
	</div>

	{#if logs.length > 0}
		<div class="mt-4">
			<h4 class="mb-2 font-medium">Logs</h4>
			<pre class="p-4 overflow-auto font-mono text-sm rounded bg-gray-50 max-h-[50vh]">{logs.join('\n')}</pre>
		</div>
	{/if}
</div>