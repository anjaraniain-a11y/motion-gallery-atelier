<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep media categories and public visibility selection in a shared browser-safe module so home and archives obey the same rules.
- Use the shared MediaCard for portfolio images and videos; its accessible dialog and playback controls apply to both singles and brand projects.
- Contact submissions use a validated, public write-only server function; messages remain private and no read endpoint is exposed because the studio password gate is not server authentication.
- Media and project reads/writes use Cloudinary REST in server-only helpers; per-asset context holds encoded metadata and a dedicated registry asset retains empty projects, avoiding a database dependency.
- Studio media operations verify an encrypted HttpOnly server session on every call; signed direct uploads never expose the Cloudinary secret and replacements retain metadata before deleting originals.
