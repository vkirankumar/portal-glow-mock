async function main() {
    const runId = context.runId;

    const { data } = await github.rest.actions.listJobsForWorkflowRun({
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: runId
        });

    // Exclude skipped and notify job logs
    const jobs = data.jobs.filter(job => (!!job.conclusion && job.conclusion !== 'skipped') 
        && !job.name?.toLowerCase().includes('notify'));
    const releaseTag = process.env.RELEASE_TAG;
    const helmEnv = process.env.HELM_ENV;
    const actor = process.env.ACTOR;

    const elasticHost = process.env.ELASTIC_HOST;
    const elasticKey = process.env.ELASTIC_KEY;
    const elasticIndex = process.env.ELASTIC_INDEX;

    if(!elasticHost || !elasticKey || !elasticIndex) {
        core.setFailed("Missing ELASTIC_HOST / ELASTIC_KEY / ELASTIC_INDEX environment variables");
        return;
    }

    const elasticUrl = `${elasticHost}/${elasticIndex}/_doc`;
    console.log(`Posting to Elastic URL: ${elasticUrl}`);

    for (const job of jobs) {
        const body = {
        "@timestamp": job.completed_at,
        job_name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        started_at: job.started_at,
        completed_at: job.completed_at,
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: context.runId,
        release_id: process.env.RELEASE_TAG,
        env: process.env.HELM_ENV,
        actor: process.env.ACTOR,
        origin: 'github'
       }
        
                    
       console.log(`Posting to URL = ${elasticUrl}`);
       console.log(`Posting job ${job.name} to Elastic`);
       console.log("Request : " + JSON.stringify(body));
       const response = await fetch(elasticUrl, {
          method: 'POST',
          headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `ApiKey ${process.env.ELASTIC_KEY}`
                   },
                   body: JSON.stringify(body)
                  });

        const data = await response.json();
        console.log("Response : " + JSON.stringify(data));
        console.log(`Indexed job ${job.name}`);
    }
}
main().catch(err => {
    core.setFailed(err.message);
});