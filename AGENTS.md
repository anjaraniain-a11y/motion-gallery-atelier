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
- Media URLs and project metadata live in existing Cloud tables; only validated HTTPS Cloudinary delivery links are rendered, avoiding provider API calls on normal reads and writes.
- Studio mutations verify the encrypted HttpOnly session; replacing or removing a link leaves the remote file intact, while a manual legacy import copies existing API-managed URLs without reuploading.
