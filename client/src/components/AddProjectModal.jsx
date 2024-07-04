import {useState} from "react";
import {FaList} from "react-icons/fa";
import {GET_PROJECTS} from "../queries/projectQueries";
import {useMutation, useQuery} from "@apollo/client";
import {GET_CLIENTS} from "../queries/clientQueries";
import {ADD_PROJECT} from "../mutations/projectMutations";

const AddProjectModal = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [clientId, setClientId] = useState("");
    const [status, setStatus] = useState("new");

    const [addProject] = useMutation(ADD_PROJECT, {
        variables: {name, description, clientId, status},
        update(cache, {data: {addProject}}) {
            const {projects} = cache.readQuery({query: GET_PROJECTS});
            cache.writeQuery({
                query: GET_PROJECTS,
                data: {projects: [...projects, addProject]},
            })
        }
    });

    // Get clients for select
    const {loading, error, data} = useQuery(GET_CLIENTS);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (name.length === 0 || description.length === 0 || clientId.length === 0) {
            return alert("Please fill in all fields");
        }
        addProject(name, description, clientId, status);
        setName("");
        setDescription("");
        setStatus("new");
        setClientId("");
    }

    if (loading) return null;
    if (error) return "Something went wrong";

    return (
        <>
            {!loading && !error && (
                <>

                    <button type="button" className="btn btn-primary" data-bs-toggle="modal"
                            data-bs-target="#addProjectModal">
                        <div className="d-flex align-items-center">
                            <FaList className="icon"/>
                            <div>New Project</div>
                        </div>
                    </button>


                    <div className="modal fade" id="addProjectModal" tabIndex="-1"
                         aria-labelledby="addProjectModalLabel"
                         aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="addProjectModalLabel">Create a project</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"
                                            aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input className="form-control" id="name" type="text" value={name}
                                                   onChange={(e) => setName(e.target.value)}/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-control" id="description" value={description}
                                                      onChange={(e) => setDescription(e.target.value)}></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" id="status" value={status}
                                                    onChange={(e) => setStatus(e.target.value)}>
                                                <option value="new">Not Started</option>
                                                <option value="progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Client</label>
                                            <select className="form-select" id="clientId" value={clientId}
                                                    onChange={(e) => setClientId(e.target.value)}>
                                                <option value="">Select a Client</option>
                                                {data.clients.map((client) => {
                                                    return (
                                                        <option key={client.id}
                                                                value={client.id}>{client.name}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                        <button className="btn btn-primary" type="submit" data-bs-dismiss="modal">
                                            Submit
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default AddProjectModal;