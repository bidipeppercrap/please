export default function Home() {
  const todo = [
    'collection - add product to collection modal',
    'collection - edit product description and note',
    'collection - edit collection name',
    'category - edit category',
    'product - edit category'
  ]

  return (
    <main className="container-fluid mt-5 mb-5">
      <div className="d-grid justify-content-center">
        <div className="listview">
          <h1 className="text-center mb-3">Todo</h1>
          <ul className="list-group">
            {
              todo.map(i =>
                <li className="list-group-item">{i}</li>
              )
            }
          </ul>
        </div>
      </div>
    </main>
  )
}