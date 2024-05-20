import { FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";

export default function DocsGlossary() {
    return (
        <Prose>
            <h1>Docs &mdash; Glossary</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Docs Home
                </Button>
            </a>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Term</TableHead>
                        <TableHead>Meaning</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <a href="/docs/network-user-reports" className="link" target="_blank">
                                Network User Reports
                            </a>
                        </TableCell>
                        <TableCell>
                            A collection of evidence filed against one or more users with the intent of allowing other servers to become aware of a potential
                            problem / threat.
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#structure" className="link" target="_blank">
                                Council Advisor
                            </a>
                        </TableCell>
                        <TableCell>
                            The secondary representative of a TCN server. Servers are not required to have one. They can contribute to discussions as well and
                            perform tasks on behalf of the server owner (including voting) if the responsibility is delegated to them.
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#delegation" className="link" target="_blank">
                                Delegation
                            </a>
                        </TableCell>
                        <TableCell>
                            The action of temporarily granting the council advisor primary representation of a server, making them the voter and point of
                            contact.
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#induction" className="link" target="_blank">
                                Induction
                            </a>
                        </TableCell>
                        <TableCell>
                            The process of adding a new server to the network, usually referring to the actual act of adding the server and inviting its
                            representative(s).
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#general-protocols" className="link" target="_blank">
                                Major Vote
                            </a>
                        </TableCell>
                        <TableCell>A vote with 75% quorum</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#general-protocols" className="link" target="_blank">
                                Minor Vote
                            </a>
                        </TableCell>
                        <TableCell>A vote with 60% quorum</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/observation-faq" className="link" target="_blank">
                                Observation
                            </a>
                        </TableCell>
                        <TableCell>
                            The process of overseeing a server&apos;s actions. This is carried out by an observer who publishes a report for voting at the end
                            of observation.
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#observer-committee" className="link" target="_blank">
                                Observer
                            </a>
                        </TableCell>
                        <TableCell>
                            An admin of the Teyvat Collective Network. They represent the network publicly, handle internal administrative tasks, observe
                            applicants for induction, and regulate the HQ environment if needed.
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#general-protocols" className="link" target="_blank">
                                Quorum
                            </a>
                        </TableCell>
                        <TableCell>The voter turnout requirement. For minor votes (most votes), it is 60%. For major votes, it is 75%.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <a href="/constitution#structure" className="link" target="_blank">
                                Server Owner
                            </a>
                        </TableCell>
                        <TableCell>
                            The owner of a TCN server. By default, the designated voter is the server owner, but this can be delegated to the council advisor.
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Prose>
    );
}
