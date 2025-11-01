<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Project, Pipeline } from '$lib/remote/api';
	import { getPipelineStatus, getPipelineLogs } from '$lib/remote/api';

	interface PipelineCardProps {
		pipeline: Pipeline;
		project: Project;
	}

	let { pipeline, project }: PipelineCardProps = $props();

	let logs: string[] = $state([]);
	let intervalId: NodeJS.Timeout;

	async function updateStatus() {
		try {
			const updatedPipeline = await getPipelineStatus(pipeline.pipelineId);
			pipeline = updatedPipeline;
			console.log({ pipeline, updatedPipeline });

			console.log({ updatedPipeline });
			const logsResponse = await getPipelineLogs(pipeline.id);
			logs.push(logsResponse.logs);

			if (pipeline.status === 'success' || pipeline.status === 'failed') {
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
		}[pipeline.status]
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
			<p class="text-sm text-gray-500">Pipeline ID: {pipeline.id}</p>
		</div>
		<span class="rounded-full px-3 py-1 text-sm font-medium {statusColor}">
			{pipeline.status}
		</span>
	</div>

	{#if logs}
		<div class="mt-4">
			<h4 class="mb-2 font-medium">Logs</h4>
			<pre class="p-4 overflow-x-auto font-mono text-sm rounded bg-gray-50">{logs}</pre>
		</div>
	{/if}
</div>
