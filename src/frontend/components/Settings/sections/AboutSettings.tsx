import { GithubLogoIcon, BugIcon } from '@phosphor-icons/react';
import { useDashboard } from '@irdashies/context';

const REPO_URL = 'https://github.com/oluops/gapline';
const UPSTREAM_URL = 'https://github.com/tariknz/irdashies';

export const AboutSettings = () => {
  const { version } = useDashboard();

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-slate-300">
            Gapline is a free, open-source overlay app for iRacing: relative,
            standings, delta bar and delta map, radar, fuel, track maps and
            more.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Version</h3>
          <p className="text-slate-300">{version}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Connect</h3>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors w-fit"
          >
            <GithubLogoIcon size={24} weight="bold" />
            <span>GitHub Repository</span>
          </a>

          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors w-fit"
          >
            <BugIcon size={24} weight="bold" />
            <span>Report a bug or request a feature</span>
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Credits</h3>
          <p className="text-sm text-slate-400">
            Gapline is built on{' '}
            <a
              href={UPSTREAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white underline"
            >
              irDashies
            </a>{' '}
            by Tarik Alani and its contributors, used under the MIT License.
            Most of what you see here is their work.
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <h3 className="text-lg font-semibold">Privacy</h3>
          <p className="text-sm text-slate-400">
            Gapline does not collect analytics or usage data. Telemetry is read
            locally from iRacing on your PC and never leaves it. The only
            network features are ones you turn on yourself (such as Twitch chat
            or Garage 61 imports) and update checks against the GitHub
            repository above.
          </p>
        </div>
      </div>
    </div>
  );
};
