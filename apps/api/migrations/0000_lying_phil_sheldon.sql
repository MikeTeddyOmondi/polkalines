CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`pipeline_id` text NOT NULL,
	`contract_address` text,
	`network` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pipelines` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`status` text NOT NULL,
	`job_id` text,
	`logs` text,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`repo_url` text NOT NULL,
	`type` text NOT NULL,
	`framework` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
