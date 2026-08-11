const fs = require('fs');

// BookWorkers.tsx
let bookCode = fs.readFileSync('src/pages/BookWorkers.tsx', 'utf8');

// Replace local state with context
bookCode = bookCode.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport { useAppContext, WorkerRequest } from '../context/AppContext';"
);

// Remove local interface and initialRequests
bookCode = bookCode.replace(/interface WorkerRequest \{[\s\S]*?status: 'pending' \| 'approved' \| 'completed';\n}\n\nconst initialRequests: WorkerRequest\[] = \[\n[\s\S]*?\];\n\n/g, '');

// Update component to use context
bookCode = bookCode.replace(
  "const [requests, setRequests] = useState<WorkerRequest[]>(initialRequests);",
  "const { workerRequests: requests, setWorkerRequests: setRequests, addNotification } = useAppContext();"
);

// Update status to support rejected
bookCode = bookCode.replace(
  "status: 'pending' | 'approved' | 'completed';",
  "status: 'pending' | 'accepted' | 'rejected' | 'completed';"
);

bookCode = bookCode.replace(
  "status: 'pending'",
  "status: 'pending', farmerId: user.id"
);

bookCode = bookCode.replace(
  "setRequests([newRequest, ...requests]);",
  "setRequests([newRequest, ...requests]);\n    addNotification({\n      userId: 'worker_all',\n      title: 'New Work Request',\n      message: `${formData.farmerName} requested workers for ${formData.workName}`\n    });"
);

// We need to handle the toggleStatus mapping:
// Instead of approved, we have accepted/rejected by worker. Admin can still mark 'completed'.
bookCode = bookCode.replace(
  "status === 'approved'",
  "status === 'accepted'"
);
bookCode = bookCode.replace(
  "status === 'approved'",
  "status === 'accepted'"
);
bookCode = bookCode.replace(
  "status === 'approved'",
  "status === 'accepted'"
);

bookCode = bookCode.replace(
  "req.status === 'pending' ? 'Approve' : req.status === 'accepted' ? 'Mark Completed' : 'Reset'",
  "req.status === 'accepted' ? 'Mark Completed' : req.status"
);

fs.writeFileSync('src/pages/BookWorkers.tsx', bookCode);


// WorkerJobs.tsx
let workerCode = fs.readFileSync('src/pages/WorkerJobs.tsx', 'utf8');

workerCode = workerCode.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport { useAppContext, WorkerRequest } from '../context/AppContext';"
);

workerCode = workerCode.replace(/interface WorkerRequest \{[\s\S]*?status: 'pending' \| 'accepted' \| 'completed';\n}\n\nconst initialJobs: WorkerRequest\[] = \[\n[\s\S]*?\];\n\n/g, '');

workerCode = workerCode.replace(
  "const [jobs, setJobs] = useState<WorkerRequest[]>(initialJobs);",
  "const { workerRequests: jobs, setWorkerRequests: setJobs, addNotification } = useAppContext();"
);

// Add reject button as well
workerCode = workerCode.replace(
  "const handleAcceptJob = (id: string) => {",
  "const handleAcceptJob = (job: WorkerRequest) => {\n    setJobs(jobs.map(j => \n      j.id === job.id ? { ...j, status: 'accepted', acceptedByWorkerId: user.id } : j\n    ));\n    addNotification({\n      userId: job.farmerId,\n      title: 'Job Accepted',\n      message: `${user.name} accepted your request for ${job.workName}`\n    });\n  };\n\n  const handleRejectJob = (job: WorkerRequest) => {\n    setJobs(jobs.map(j => \n      j.id === job.id ? { ...j, status: 'rejected' } : j\n    ));\n    addNotification({\n      userId: job.farmerId,\n      title: 'Job Rejected',\n      message: `${user.name} rejected your request for ${job.workName}`\n    });\n  };"
);

// We need to fix the button to call with job
workerCode = workerCode.replace(
  "onClick={() => handleAcceptJob(job.id)}",
  "onClick={() => handleAcceptJob(job)}"
);

workerCode = workerCode.replace(
  "Accept Job\n                      </button>",
  "Accept Job\n                      </button>\n                      <button \n                        onClick={() => handleRejectJob(job)}\n                        className=\"ml-2 text-sm font-semibold px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors shadow-sm\"\n                      >\n                        Reject\n                      </button>"
);

fs.writeFileSync('src/pages/WorkerJobs.tsx', workerCode);

console.log('Done');
