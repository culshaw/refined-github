import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import GitHubURL from '../github-helpers/github-url';
import { buildRepoURL} from '../github-helpers';
import * as api from '../github-helpers/api';

async function init(): Promise<void | false> {
	const element = await elementReady('.PageHeader-title');
	if (!element || element?.querySelector(".pr-ref")) {
		return false;
	}

	const parsedUrl = new GitHubURL(location.href);
	const jobParams = parsedUrl.filePath.split("/");
	const jobId = jobParams[jobParams.length-1];

	const job = await api.v3(`/repos/${parsedUrl.user}/${parsedUrl.repository}/actions/runs/${jobId}`);
	if(job.pull_requests.length > 0) {
		// We have a PR, let's link it. Assume the first PR.
		const PR = job.pull_requests[0];
		const repoURL = buildRepoURL(`pull/${PR.number}`);

		element.append(
			<span className="pr-ref">
				<a className="no-underline" href={repoURL} data-turbo-frame="repo-content-turbo-frame">
					PR#{PR.number}
				</a>
			</span>,
		)

	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isActionRun,
	],
	init,
});
