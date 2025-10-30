const API_URL = import.meta.env.VITE_API_URL;

export interface Project {
	id: string;
	name: string;
	repoUrl: string;
	type: 'ink-contract' | 'dapp';
	framework?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Pipeline {
	id: string;
	pipelineId: string;
	projectId: string;
	status: 'pending' | 'running' | 'success' | 'failed';
	jobId?: string;
	logs?: string;
	startedAt?: string;
	completedAt?: string;
	createdAt: string;
}

export async function createProject(data: {
	name: string;
	repoUrl: string;
	type: 'ink-contract' | 'dapp';
	framework?: string;
}): Promise<Project> {
	const response = await fetch(`${API_URL}/api/projects`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error('Failed to create project');
	}

	return response.json();
}

export async function listProjects(): Promise<Project[]> {
	const response = await fetch(`${API_URL}/api/projects`);

	if (!response.ok) {
		throw new Error('Failed to fetch projects');
	}

	return response.json();
}

export async function triggerPipeline(projectId: string): Promise<Pipeline> {
	const response = await fetch(`${API_URL}/api/pipelines`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectId })
	});

	if (!response.ok) {
		throw new Error('Failed to trigger pipeline');
	}

	return response.json();
}

export async function getPipelineStatus(pipelineId: string): Promise<Pipeline> {
	const response = await fetch(`${API_URL}/api/pipelines/${pipelineId}`);

	if (!response.ok) {
		throw new Error('Failed to get pipeline status');
	}

	return response.json();
}

export async function getPipelineLogs(pipelineId: string): Promise<{ logs: string }> {
	const response = await fetch(`${API_URL}/api/pipelines/${pipelineId}/logs`);

	if (!response.ok) {
		throw new Error('Failed to get pipeline logs');
	}

	return response.json();
}

export async function cancelPipeline(pipelineId: string): Promise<{ message: string }> {
	const response = await fetch(`${API_URL}/api/pipelines/${pipelineId}/cancel`, {
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to cancel pipeline');
	}

	return response.json();
}
