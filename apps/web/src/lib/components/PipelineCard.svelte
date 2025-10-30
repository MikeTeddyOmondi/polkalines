<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Project, Pipeline } from '$lib/remote/api';
  import { getPipelineStatus, getPipelineLogs } from '$lib/remote/api';

  export let pipeline: Pipeline;
  export let project: Project;

  let logs = '';
  let intervalId: NodeJS.Timeout;

  async function updateStatus() {
    try {
      const updatedPipeline = await getPipelineStatus(pipeline.id);
      pipeline = updatedPipeline;

      const logsResponse = await getPipelineLogs(pipeline.id);
      logs = logsResponse.logs;

      if (pipeline.status === 'success' || pipeline.status === 'failed') {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error updating pipeline status:', error);
    }
  }

  $: statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }[pipeline.status];

  // Poll for updates every 2 seconds
  intervalId = setInterval(updateStatus, 2000);

  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

<div class="bg-white shadow rounded-lg p-6 mb-4">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-lg font-semibold">{project.name}</h3>
      <p class="text-sm text-gray-500">Pipeline ID: {pipeline.id}</p>
    </div>
    <span class="px-3 py-1 rounded-full text-sm font-medium {statusColor}">
      {pipeline.status}
    </span>
  </div>

  {#if logs}
    <div class="mt-4">
      <h4 class="font-medium mb-2">Logs</h4>
      <pre class="bg-gray-50 p-4 rounded text-sm font-mono overflow-x-auto">{logs}</pre>
    </div>
  {/if}
</div>