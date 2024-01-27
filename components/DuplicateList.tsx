export default function DuplicateList(
    { children, name, list, isLoading }:
    { children: any, name: string, list: any[], isLoading: boolean }
) {
    if (name.length < 1)
        return <h5 className='text-secondary text-center'>Type a name</h5>
    if (isLoading)
        return <h5 className="text-secondary text-center">Searching...</h5>
    if (list.length < 1 && !isLoading)
        return <h5 className='text-secondary text-center'>No possible duplicate</h5>
    return children
}