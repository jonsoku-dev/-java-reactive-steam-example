CREATE TABLE `analysis_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`market_data` varchar(1024),
	`macro_regime` json,
	`portfolio` json,
	`red_team` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `analysis_results_id` PRIMARY KEY(`id`)
);
