import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { CronJob, cronJobApi } from "../../api/endpoints/cron-job.api";
import { jobStore } from "../+workloads-jobs/job.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class CronJobStore extends KubeObjectStore<CronJob> {
  api = cronJobApi

  getStatuses(cronJobs?: CronJob[]) {
    const status = { failed: 0, running: 0 }
    cronJobs.forEach(cronJob => {
      if (cronJob.spec.suspend) {
        status.failed++
      }
      else {
        status.running++
      }
    })
    return status
  }

  getActiveJobsNum(cronJob: CronJob) {
    // Active jobs are jobs without any condition 'Complete' nor 'Failed'
    const jobs = jobStore.getJobsByOwner(cronJob);
    if (!jobs.length) return 0;
    return jobs.filter(job => !job.getCondition()).length;
  }
}

export const cronJobStore = new CronJobStore();
apiManager.registerStore(cronJobApi, cronJobStore);
