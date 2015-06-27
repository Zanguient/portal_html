/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", ['servicos']) 

.controller("administrativo-usuariosCtrl", ['$scope','$state', '$campos', function($scope,$state,$campos){ 
    
    
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
    };
    
}])


// CADASTRO

.controller("administrativo-usuarios-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$campos',
                                                     '$webapi',
                                                     '$apis',
                                                     '$autenticacao', function($scope,$state,$campos,$webapi,$apis,$autenticacao){ 
    
    var token = '';
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.aa = 'meu nome';
    $scope.pessoa = {nome:'', data_nasc:'', telefone:'', ramal:''};
    $scope.usuario = {login:'', email:'', grupoempresa:undefined, empresa:undefined};
    $scope.roles = [];
    // Flags
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;
    $scope.validandoLogin = false;
    $scope.validandoEmail = false;                                                    
    
    // Inicialização do controller
    $scope.administrativoUsuariosCadastroInit = function(){
        // Título da página
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Cadastro de Usuário';
        $scope.setTabCadastro(1);
        $scope.atualizaProgressoDoCadastro();
        token = $autenticacao.getToken();
    };
    
    
    // Cancelar
    $scope.cancelar = function(){
        // Verifica se possui dados preenchidos
        if($scope.pessoa.nome || $scope.pessoa.data_nasc || $scope.pessoa.telefone || $scope.pessoa.ramal || 
           $scope.usuario.email || $scope.usuario.empresa || $scope.usuario.grupoempresa || $scope.usuario.login ||
           $scope.roles.length > 0){
           if(!confirm('Tem certeza que deseja descartar as informações preenchidas?')) return;
        }
        $scope.goAdministrativoUsuarios();
    };
                                                         
    // Cadastrar Usuário
    $scope.cadastrarUsuario = function(){
        if($scope.formCadastroUsuario.$valid) {
            alert("FORMULARIO VALIDO!");
        }else alert("FORMULARIO INVALIDO!");
    };
                                                         
    // TAB
    
    // Vai para a tab anterior
    $scope.setTabAnterior = function(){
        if($scope.tabCadastro > 1) $scope.setTabCadastro($scope.tabCadastro - 1);
    };
    // Vai para a próxima tab
    $scope.setProximaTab = function(){
        if($scope.tabCadastro < 4) $scope.setTabCadastro($scope.tabCadastro + 1);
    };
    // Modifica a tab atual
    $scope.setTabCadastro = function(tab) {
        $scope.tabCadastro = tab;
    };
    // Retorna true se a tab informada é a selecionada
    $scope.tabCadastroSelecionada = function(tab){
        return $scope.tabCadastro === tab;
    };
    
    // Validação dos campos
    // PESSOA
    $scope.dataValida = function(){
        return dataValida;    
    };
    $scope.validaData = function(){
        if($scope.pessoa.data_nasc){
            var parts = $scope.pessoa.data_nasc.split("/");
            var data = new Date(parts[2], parts[1] - 1, parts[0]);//Date.parse($scope.pessoa.data_nasc);
            // Verifica se a data é válida
            dataValida = parts[0] == data.getDate() && (parts[1] - 1) == data.getMonth() && parts[2] == data.getFullYear();
        }else dataValida = false;
    };
    // USUÁRIO
    $scope.emailValido = function(){
        return emailValido;    
    }
    $scope.loginValido = function(){
        return loginValido;    
    }
    //Valida e-mail
    $scope.validaEmail = function(){
        if($scope.usuario.email){
            $scope.validandoEmail = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.email, valor:$scope.usuario.email});
            // Verifica se a requisição foi respondida com sucesso
            dadosAPI.then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelEmailEmUso').show();
                                emailValido = false;
                                $('#icon-email').show();
                            }else{
                                $('#labelEmailEmUso').hide();
                                emailValido = true;
                                $('#icon-email').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoEmail = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR E-MAIL");
                            $scope.validandoEmail = false;
                        });
        }else{
            emailValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    //Valida login
    $scope.validaLogin = function(){
        if($scope.usuario.login){
            $scope.validandoLogin = true;
            var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0], {id:$campos.administracao.webpageusers.login, valor:$scope.usuario.login});
            // Verifica se a requisição foi respondida com sucesso
            dadosAPI.then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelLoginEmUso').show();
                                loginValido = false;
                                $('#icon-login').show();
                            }else{
                                $('#labelLoginEmUso').hide();
                                loginValido = true;
                                $('#icon-login').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoLogin = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR LOGIN");
                            $scope.validandoLogin = false;
                        });
        }else{
            loginValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    
    // Progresso do cadastro
    // Form Pessoa                                                     
    var getPercentualFormPessoa = function(){
        var percentual = $scope.pessoa.nome ? 25 : 0; // nome => obrigatório
        if(percentual > 0){
            // Avalia se há conteúdo no input. Se tiver, tem que ser um conteúdo válido
            var conteudoData = '';
            var conteudoTelefone = '';
            var conteudoRamal = '';
            if($scope.formCadastroUsuario){
                conteudoData = $scope.formCadastroUsuario.pessoaDataNasc.$viewValue;
                conteudoTelefone = $scope.formCadastroUsuario.pessoaTelefone.$viewValue;
                conteudoRamal = $scope.formCadastroUsuario.pessoaRamal.$viewValue;
            }
            percentual += !conteudoData || dataValida ? 25 : 0; // data
            percentual += !conteudoTelefone || $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += !conteudoRamal || $scope.pessoa.ramal ? 25 : 0; // telefone
        }else{
            percentual += dataValida ? 25 : 0; // data
            percentual += $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += $scope.pessoa.ramal ? 25 : 0; // telefone
        }
        return percentual;    
    };
    // Form Usuário                                                    
    var getPercentualFormUsuario = function(){
        var percentual = $scope.loginValido() ? 25 : 0; // login => obrigatório
        percentual += $scope.emailValido() ? 25 : 0; // e-mail => obrigatório
        if(percentual > 0){
            percentual += $scope.loginValido() ? 25 : 0; // tanto faz o cara ter ou não associado um grupo empresa
            percentual += $scope.emailValido() ? 25 : 0; // tanto faz o cara ter ou não associado uma empresa
        }else{
            percentual += $scope.usuario.empresa ? 25 : 0;
            percentual += $scope.usuario.grupoempresa ? 25 : 0;
        }
        return percentual;    
    };
    // Form Roles
    var getPercentualFormRoles = function(){
        return $scope.roles.length > 0 ? 100 : 0 ; // temp  
    };
    // Progresso                                                     
    $scope.atualizaProgressoDoCadastro = function(){
        // São obrigatórios: 1 campo para pessoa (nome), 2 campos obrigatórios para usuário (login e e-mail) e alguma role
        var progressoPessoa = getPercentualFormPessoa();
        var progressoUsuario = getPercentualFormUsuario();
        var progressoRoles = progressoPessoa + progressoUsuario == 200 ? 100 : 0;//getPercentualFormRoles();
        // Atualiza
        var percent = (progressoPessoa + progressoUsuario + progressoRoles) / 3;
        $('#form_wizard_1').find('.progress-bar').css({
            width: percent + '%'
        });    
    };
    
}]);