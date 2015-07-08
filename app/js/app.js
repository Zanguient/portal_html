/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("AtosCapital", ['ui.router', 
                               'ui.bootstrap',
                               'ui.checkbox',
                               'jsTree.directive',
                               //'dialogs',
                               'diretivas',
                               'servicos', 
                               'nao-autorizado', 
                               'nao-encontrado',
                               'administrativo-usuarios',
                               'administrativo-usuarios-cadastro',
                               'administrativo-privilegios',
                               'administrativo-modulos-funcionalidades',
                               'administrativo-acesso-usuarios',
                               'dashboard', 
                               'card-services-conciliacao-vendas']) 

// CONTROLLER  PAI
.controller("appCtrl", ['$scope',
                        '$rootScope',
                        '$location',
                        '$state',
                        '$stateParams',
                        '$http',
                        '$timeout',
                        '$modal',
                        '$autenticacao',
                        '$apis',
                        '$webapi',
                        '$empresa',
                        '$campos',
                        '$filter',
                        function($scope,$rootScope,$location,$state,$stateParams,$http,$timeout,$modal,
                                 $autenticacao,$apis,$webapi,$empresa,$campos,$filter){ 
    // Título da página                            
    $scope.pagina = {'titulo': 'Home', 'subtitulo': ''};
    // Usuário
    $scope.token = '';
    $scope.nome_usuario = 'Usuário';
    // Dados da empresa
    $scope.empresa = $empresa;
    // Grupo empresa selecionado
    var empresaId = -1; // se > 0 indica que já estava associado a um grupo empresa
    $scope.grupoempresa = undefined; // grupo empresa em uso
    $scope.gempresa = null;  // objeto que recebe temporariamente o grupo empresa da busca
    // URL da página de login
    var telaLogin = '../';                      
    // Flag
    $scope.exibeLayout = false; // true => carrega layout completo
    var menuConstruido = false;
    $scope.carregandoGrupoEmpresas = false; // indica se está aguardando o objeto com os grupos empresa (para usuário administrativo)
    // Permissões
    $scope.PERMISSAO_ADMINISTRATIVO = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = false;
    $scope.PERMISSAO_DASHBOARD = false;
    $scope.PERMISSAO_CARD_SERVICES = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = false;
                            
                            
    
    // Fullscreen                                                 
    var removeDivFullscreen = function(){
        if ($('body').hasClass('page-portlet-fullscreen')) $('body').removeClass('page-portlet-fullscreen');
    }                       
                            
                            
    // LINKS
    /**
      * Envia o broadcast para os controllers filhos, notificando a requisição de mudança de estado
      * Isso foi feito visando telas que possuem informações preenchidas pelo usuário e
      * questiona se de fato ele deseja descarta-las antes de prosseguir
      */                         
    $scope.go = function(state, params){
        if(menuConstruido){ 
            removeDivFullscreen();
            if(!$state.current.name) $state.go(state, params); // estado inicial
            else $scope.$broadcast('mudancaDeRota', state, params);
        }
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Usuários, de Administrativo
      */                     
    $scope.goAdministrativoUsuarios = function(params){
        $scope.go('administrativo-gestao-acesso-usuarios', params); 
    };
    /**
      * Exibe como conteúdo de cadastro de usuário da Gestão de Acessos, de Administrativo
      */                        
    $scope.goAdministrativoUsuariosCadastro = function(params){
        $scope.go('administrativo-gestao-acesso-usuarios-cadastro', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Privilégios, de Administrativo
      */                        
    $scope.goAdministrativoPrivilegios = function(params){
        $scope.go('administrativo-gestao-acesso-privilegios', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Módulos e Funcionalidades, de Administrativo
      */                        
    $scope.goAdministrativoModulosFuncionalidades = function(params){
        $scope.go('administrativo-gestao-acesso-modulos-funcionalidades', params);
    }; 
    /**
      * Exibe como conteúdo a Logs Acesso de Usuários, de Administrativo
      */                        
    $scope.goAdministrativoAcessoUsuarios = function(params){
        $scope.go('administrativo-logs-acesso-usuarios', params);
    };                         
    /**
      * Exibe como conteúdo o Dashboard
      */                        
    $scope.goDashboard = function(params){
        //if(!$state.is('dashboard')) 
            $scope.go('dashboard', params);
        //else console.log("JA ESTÁ NO DASHBOARD");
    };
    /**
      * Exibe como conteúdo a Conciliação de Vendas de Card Services
      */
    $scope.goCardServicesConciliacaoVendas = function(params){
        $scope.go('card-services-conciliacao-vendas', params);
    }; 
                            
    /** 
      * Valida o acesso a url, considerando as permissões
      */
    $rootScope.$on("$locationChangeStart", function(event, next, current){
        if(current === next){
           event.preventDefault();
           //console.log("LOCATION CHANGE ===");
           return; 
        }
        //console.log("FROM " + current + " TO " + next);
        var url = next.split('#')[1];
        // Avalia
        if(url === $state.get('administrativo-gestao-acesso-usuarios').url || url === $state.get('administrativo-gestao-acesso-usuarios-cadastro').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }else if(url === $state.get('administrativo-gestao-acesso-privilegios').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            } 
        }else if(url === $state.get('administrativo-gestao-acesso-modulos-funcionalidades').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }  
        }else if(url === $state.get('administrativo-logs-acesso-usuarios').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            } 
        }else if(url === $state.get('dashboard').url){ 
            // Dashboard
            if(!$scope.PERMISSAO_DASHBOARD){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }else if(url === $state.get('card-services-conciliacao-vendas').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }
        //else event.preventDefault();//console.log("VAI PARA ONDE?");
     });
                            
    /**
      * Retorna para a tela de login
      */
    $scope.voltarTelaLogin = function(){
        $autenticacao.removeDadosDeAutenticacao();
        window.location.replace(telaLogin);
    };   
    /**
      * Retorna a função que faz o link para o item com o título informado
      */                        
    var getLink = function(titulo){
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'USUÁRIOS' : return $scope.goAdministrativoUsuarios;
            case 'PRIVILÉGIOS' : return $scope.goAdministrativoPrivilegios; 
            case 'MÓDULOS E FUNCIONALIDADES' : return $scope.goAdministrativoModulosFuncionalidades;
            case 'ACESSO DE USUÁRIOS' : return $scope.goAdministrativoAcessoUsuarios;    
            // Dashboard
            case 'DASHBOARD': return $scope.goDashboard;  
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return $scope.goCardServicesConciliacaoVendas;
            // ...
            default : return function(){};        
        }
    };
    
    // PERMISSÕES
    /**
      * Atribui a permissão para o respectivo título 
      * OBS: título não é uma boa referência. O ideal seria identificadores, 
      * visto que podem existir títulos idênticos em Serviços distintos
      */                         
    var atribuiPermissao = function(titulo){ // , tituloPai){
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'ADMINISTRATIVO' : $scope.PERMISSAO_ADMINISTRATIVO = true; break;
            case 'GESTÃO DE ACESSOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = true; break;
            case 'USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = true; break;
            case 'PRIVILÉGIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = true; break;
            case 'MÓDULOS E FUNCIONALIDADES' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = true; break;
            case 'LOGS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS = true; break;
            case 'ACESSO DE USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = true; break;
            // Dashboard
            case 'DASHBOARD': $scope.PERMISSAO_DASHBOARD = true; break;
            // Card Services
            case 'CARD SERVICES': $scope.PERMISSAO_CARD_SERVICES = true; break;
            case 'CONCILIAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = true; break;
            case 'CONCILIAÇÃO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = true; break;
            // ...
            default : return ;        
        }
    };
             
    // LAYOUT
    /**
      * Informa se o título informado se refere ao menu que está ativo no momento
      */
    $scope.menuAtivo = function(titulo){
        var state = $state.current.url.split('/')[1]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'ADMINISTRATIVO' : return state == 'administrativo';
            // Dashboard
            case 'DASHBOARD': return state == 'dashboard';
            // Card Services
            case 'CARD SERVICES': return state == 'card-services';
                
            default : return false;        
        }
        
    };
    /**
      * Informa se o título informado se refere ao módulo que está ativo no momento
      */
    $scope.moduloAtivo = function(titulo){
        var state = $state.current.url.split('/')[2]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'USUÁRIOS' : return state == 'usuarios' || state == 'cadastro-usuarios';
            case 'PRIVILÉGIOS' : return state == 'privilegios';
            case 'MÓDULOS E FUNCIONALIDADES' : return state == 'modulos-funcionalidades';
            case 'ACESSO DE USUÁRIOS' : return state == 'acesso-usuarios';    
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return state == 'conciliacao-vendas';
                
            default : return false;        
        }        
    };
    /**
      * A partir do JSON recebido, obtem o JSON menu e as permissões do usuário
      */                        
    var constroiMenu = function(data){
        // Exemplo
        //data.id_grupo = 42;
        data.servicos = [
            {
                titulo : 'Dashboard' // ds_controller
            },
            {
                titulo : 'Card Services',
                subServicos : [
                    {
                        titulo : 'Conciliação', 
                        modulos : [
                            {
                                titulo : 'Conciliação de Vendas',
                                // Pq em JSON? Pq pode ser a página inicial do cara, enviando assim o 'home=true' aqui!
                            }
                        ]
                    },
                    {
                        titulo : 'Consolidação', 
                        modulos : [
                            {
                                titulo : 'Relatório Sintético'
                            },
                            {
                                titulo : 'Relatório Analítico'
                            }
                        ]
                    }
                ]
            },
            {
                titulo : 'Administrativo', // possui perfil administrativo
                subServicos : [
                    {
                        titulo : 'Gestão de Acessos', 
                        modulos : [
                            {
                                titulo : 'Usuários'
                            },
                            {
                                titulo : 'Privilégios'
                            },
                            {
                                titulo : 'Módulos e Funcionalidades',
                                home : true
                            }
                        ]
                    },
                    {
                        titulo : 'Logs', 
                        modulos : [
                            {
                                titulo : 'Acesso de usuários'
                            }
                        ]
                    }
                ]
            }
        ];
        
        // Constrói o menu
        $scope.menu = [];
        for(var k = 0; k < data.servicos.length; k++){
            var servico = data.servicos[k];
            var menu = {};
            menu.titulo = servico.titulo;
            // Atribui permissão
            atribuiPermissao(menu.titulo);
            // Verifica se estava administrando algum grupo empresa
            if(servico.id_grupo) empresaId = servico.id_grupo;
            
            // Subserviços
            if(servico.subServicos){
                menu.subServicos = [];
                for(var j = 0; j < servico.subServicos.length; j++){
                    var subServico = servico.subServicos[j];
                    var subMenu = {};
                    subMenu.titulo = subServico.titulo;
                    // Atribui permissão
                    atribuiPermissao(subMenu.titulo);
                    
                    // Módulos
                    if(subServico.modulos){
                        subMenu.modulos = [];
                        for(var i = 0; i < subServico.modulos.length; i++){
                            var modulo = subServico.modulos[i];
                            var itemMenu = {};
                            itemMenu.titulo = modulo.titulo;
                            // Atribui permissão
                            atribuiPermissao(itemMenu.titulo);
                            itemMenu.link = getLink(itemMenu.titulo);
                            if(modulo.home && !$scope.goHome) $scope.goHome = itemMenu.link;
                            // Adiciona o módulo
                            subMenu.modulos.push(itemMenu);
                        }
                    }else{
                        // Se não tem módulos, então deve ter um link
                        subMenu.link = getLink(subMenu.titulo); 
                        // Página inicial é definido pelo primeiro 'home=true' encontrado        
                        if(subServico.home && !$scope.goHome) $scope.goHome = subMenu.link;
                    }
                    
                    // Adiciona o subserviço
                    menu.subServicos.push(subMenu);
                }
            }else{
                // Se não tem subserviços, então deve ter um link
                menu.link = getLink(menu.titulo); 
                // Página inicial é definido pelo primeiro 'home=true' encontrado        
                if(servico.home && !$scope.goHome) $scope.goHome = menu.link;
            }
            
            // Adiciona o menu
            $scope.menu.push(menu);
        }
        
        // Verifica se estava administrando algum grupo empresa
        if($scope.PERMISSAO_ADMINISTRATIVO && data.id_grupo) obtemGrupoEmpresa(data.id_grupo);
        
        // Seta o flag para true
        menuConstruido = true;
    };
    /**
      * Inicializa layout e seus handlers
      */
    var inicializaLayout = function(){
        // Carrega todos os handlers de layout
        jQuery(document).ready(function() { 
        //$rootScope.$on('$viewContentLoaded', function(){
           Metronic.init(); // init metronic core componets
           Layout.init(); // init layout
           Tasks.initDashboardWidget(); // init tash dashboard widget   
        });
    };
                            
    /**
      * Redireciona página
      */
    var exibePaginaAtual = function(){
        // Direciona para a página
        switch($location.path()){
            case $state.get('dashboard').url : 
                $scope.goDashboard(); break;
            case $state.get('administrativo-gestao-acesso-usuarios').url : 
                 $scope.goAdministrativoUsuarios(); break;
            case $state.get('administrativo-gestao-acesso-usuarios-cadastro').url : 
                $scope.goAdministrativoUsuariosCadastro(); break;
            case $state.get('administrativo-gestao-acesso-privilegios').url : 
                 $scope.goAdministrativoPrivilegios(); break;    
            case $state.get('card-services-conciliacao-vendas').url : 
                $scope.goCardServicesConciliacaoVendas(); break;
            default : $scope.goHome(); // Exibe tela inicial
        }
    };                        
    
    
    /**
      * INICIALIZAÇÃO DO CONTROLLER
      */                        
    $scope.init = function(){
        // Verifica se está autenticado
        if(!$autenticacao.usuarioEstaAutenticado()){ 
            $scope.voltarTelaLogin();
            return;
        }
        // Obtém o token
        $scope.token = $autenticacao.getToken();
        if(!$scope.token){ 
            $autenticacao.removeDadosDeAutenticacao();
            $scope.voltarTelaLogin(); // what?! FATAL ERROR!
            return;
        }
        
        // Inicializa o layout
        inicializaLayout();
        // Exibe o layout
        $scope.exibeLayout = true;
        // Exibe um loading que bloqueia a página toda
        Metronic.blockUI({
            animate: true,
            overlayColor: '#000'
        });
        
        // Avalia Token
        var dadosAPI = $webapi.get($apis.autenticacao.login, $scope.token);
        // Verifica se a requisição foi respondida com sucesso
        dadosAPI.then(function(dados){
                            // Nome do usuário
                            $scope.nome_usuario = dados.nome;
                            // Atualiza token na local storage
                            $scope.token = dados.token;
                            $autenticacao.atualizaToken($scope.token);
                            // Controi menu e obtem as permissões do usuário
                            constroiMenu(dados);
                            // Exibe a página atual
                            exibePaginaAtual();
                            // Atualiza último datetime de autenticação
                            $autenticacao.atualizaDateTimeDeAutenticacao(new Date());
                            // Remove o loading da página
                            Metronic.unblockUI();
                        },
                        function(failData){
                          // Avaliar código de erro
                          if(failData.status === 500)
                              // Código 500 => Token já não é mais válido
                              $scope.voltarTelaLogin();
                          else{ 
                              console.log("FALHA AO VALIDAR TOKEN: " + failData.status);
                              // o que fazer? exibir uma tela indicando falha de comunicação?
                              // Status 0: sem resposta
                          }
                          // Remove o loading da página
                          Metronic.unblockUI();
                        });
    };
                            
    // GRUPO EMPRESA
                            
    /**
      * Reporta se está em progresso de autenticação
      */
    var progressoGrupoEmpresas = function(emProgresso){
        $scope.carregandoGrupoEmpresas = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    /**
      * Obtém um único grupo empresa, a partir do empresaId
      */
    var obtemGrupoEmpresa = function(empresaId){
         // Obtém os dados da empresa
         progressoGrupoEmpresas(true);
         // Obtém a URL                                                      
         $webapi.get($apis.cliente.grupoempresa, [$scope.token, 0], {id:$campos.cliente.grupoempresa.id_grupo, valor: empresaId})
            .then(function(dados){  
                $scope.grupoempresa = dados.Registros[0];
                $scope.$broadcast("alterouGrupoEmpresa");
                progressoGrupoEmpresas(false);
             },
             function(failData){
                console.log("FALHA AO OBTER GRUPO EMPRESA: " + failData.status);
                progressoGrupoEmpresas(false);
             });    
    };
    /** 
      *  Requisita a lista filtrada dos grupo empresas registrados no servidor   
      */
    $scope.buscaGrupoEmpresas = function(texto){
       progressoGrupoEmpresas(true);
       // Obtém a URL                                                      
       var url = $webapi.getUrl($apis.cliente.grupoempresa, 
                                  [$scope.token, 0, $campos.cliente.grupoempresa.ds_nome, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:$campos.cliente.grupoempresa.ds_nome, valor: texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           progressoGrupoEmpresas(false);
           return dados.data.Registros;
        },function(failData){
             console.log("FALHA AO OBTER GRUPOS EMPRESA FILTRADOS: " + failData.status);
             progressoGrupoEmpresas(false);
             return [];
          });
    };                   
    /** 
      * Seleciona Grupo Empresa
      */
    $scope.selecionaGrupoEmpresa = function(grupoempresa){
        $scope.grupoempresa = grupoempresa;
        $scope.gempresa = null; // reinicia o valor
        // Notifica
        $scope.$broadcast("alterouGrupoEmpresa");
        // Remove da visão a tela de busca do grupo empresa
        $('#admBuscaGrupoEmpresa').parent().removeClass('open');
        // Envia 
        // ....
    };
    /** 
      * Limpar Grupo Empresa
      */
    $scope.limpaGrupoEmpresa = function(){
        $scope.grupoempresa = undefined;
        // Notifica
        $scope.$broadcast("alterouGrupoEmpresa");
        // Envia
        // ....
    };
                            
                            
             
                            
                            
                            
   // Extras                       
                            
   // Exibe o alert
   var alertId = '';
   /**
     * Exibe um alert no container
     * @param mensagem : texto a ser exibido. Default: 'Por favor, aguarde'
     * @param closable : set true se deseja que apareça um botão que fecha manualmente o alert. Default: false
     * @param type : 'info' (default), 'success', 'danger', 'warning'.
     * @param scroll : set true se deseja que, ao ser exibido, a barra de rolagem rolará até ele. Default: false
     */
   $scope.showAlert = function(mensagem, closable, type, scroll){
        jQuery(document).ready(function() { 
        //$rootScope.$on('$viewContentLoaded', function(){
           $timeout(function(){
                   alertId = Metronic.alert({
                    container: '', // alerts parent container(by default placed after the page breadcrumbs)
                    place: 'append', // append or prepent in container 
                    type: type ? type : 'info',  // alert's type
                    message: mensagem ? mensagem : 'Por favor, aguarde',  // alert's message
                    close: closable ? true : false, // make alert closable
                    reset: true, // close all previouse alerts first
                    focus: scroll ? true : false, // auto scroll to the alert after shown
                    closeInSeconds: type !== 'info' ? 10 : 0, // auto close after defined seconds
                    icon: type === 'danger' || type === 'warning' ? 'warning' : type === 'success' ? 'check' : '', // put icon before the message
                    img : !type || type === 'info' ? '/img/loading-atos.gif' : '' // put img before the message
                });
            }, 0);
        }); 
   };
   // Esconde o alert
   $scope.hideAlert = function(){
       $timeout(function(){$('#' + alertId).remove();}, 0); // fecha alert
   };
                            
                            
   // MODAL
   $scope.modal_titulo = 'Titulo';
   $scope.modal_mensagem = 'Mensagem';
   $scope.modal_textoConfirma = 'Ok';
   $scope.modal_textoCancela = 'Cancelar';
   /**
     * Exibe o modal
     * @param titulo : título 
     * @param mensagem : corpo
     * @param funcaoConfirma : funcao que será invocada quando o botão confirma for pressionado
     * @param parametroFuncaoConfirma : objeto passado como parâmetro da função confirma
     * @param textoConfirma : texto exibido no botão de confirmação
     * @param textoCancela : texto exibido no botão que cancela o modal
     */
   $scope.showModal = function(titulo, mensagem, funcaoConfirma, parametroFuncaoConfirma, textoConfirma, textoCancela){
      // Seta os valores
      $scope.modal_titulo = titulo ? titulo : 'Atos Capital';
      $scope.modal_mensagem = mensagem ? mensagem : '';
      $scope.modal_textoConfirma = textoConfirma ? textoConfirma : 'Ok';
      $scope.modal_textoCancela = textoCancela ? textoCancela : 'Cancelar';
      $scope.modal_confirma = funcaoConfirma ? function(){funcaoConfirma(parametroFuncaoConfirma);} : function(){};   
      // Exibe o modal
      $('#modalConfirmacao').modal('show');
      /*var modalInstance = $modal.open({
              animation: true,
              templateUrl: 'modalContent.html',
              controller: 'appCtrl',
              size: 'sm'
            });

            modalInstance.result.then(function (selectedItem) {
                console.log("Confirma");
                //resetaSenhaDoUsuario(usuario.webpagesusers.id_users);
            }, function () {
                console.log("Fecha");
            });*/
   };  
                            
                            
   // PROGRESS                        
   /**
     * Obtém a div para exibir o loading progress
     */
   var getElementProgress = function(divPortletBodyPos){
        if(typeof divPortletBodyPos !== 'number') return undefined;
        var div = $('div[class="portlet light"]');
        if(div.length == 0){ 
            // Verifica se está em full screen
            div = $('div[class="portlet light portlet-fullscreen"]');
            if(div.length == 0) return undefined; 
        }
        var body = div.children(".portlet-body");
        if(divPortletBodyPos < 0 || divPortletBodyPos >= body.length) return undefined;
        return body[divPortletBodyPos]; 
   }
   /**
     * Exibe o loading progress no portlet-body
     */
   $scope.showProgress = function(divPortletBodyPos){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.blockUI({
            target: el,
            animate: true,
            overlayColor: '#000'//'none'
        }); 
   };
   /**
     * Remove da visão o loading progress no portlet-body
     */                         
   $scope.hideProgress = function(divPortletBodyPos){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.unblockUI(el);
   };                            
                            
}])

.config(['$stateProvider','$urlRouterProvider','$locationProvider', 
         function($stateProvider,$urlRouterProvider,$locationProvider) {
    
    // Aceitar "cross" de domínios
    //$httpProvider.defaults.useXDomain = true; 
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];               
             
    // ROTAS         
    var prefixo = '/';
    
    /* Remover o '#'
    if(window.history && window.history.pushState){ 
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        prefixo = 'app/';
    }*/
    
    $stateProvider

      // ADMINISTRATIVO
    
      .state('administrativo-gestao-acesso-usuarios', {
        url: prefixo + 'administrativo/usuarios',
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/index.html',
        controller: "administrativo-usuariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acesso-usuarios-cadastro', {
        title: 'Administrativo',
        url: prefixo + 'administrativo/cadastro-usuarios',
        params: {usuario: null},
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/views/cadastro/index.html',
        controller: "administrativo-usuarios-cadastroCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acesso-privilegios', {
        url: prefixo + 'administrativo/privilegios',
        templateUrl: 'componentes/administrativo/gestao-acessos/privilegios/index.html',
        controller: "administrativo-privilegiosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acesso-modulos-funcionalidades', {
        url: prefixo + 'administrativo/modulos-funcionalidades',
        templateUrl: 'componentes/administrativo/gestao-acessos/modulos-funcionalidades/index.html',
        controller: "administrativo-modulos-funcionalidadesCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-logs-acesso-usuarios', {
        url: prefixo + 'administrativo/acesso-usuarios',
        templateUrl: 'componentes/administrativo/logs/acesso-usuarios/index.html',
        controller: "administrativo-acesso-usuariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      // DASHBOARD
      .state('dashboard', {
        url: prefixo + 'dashboard',
        templateUrl: 'componentes/dashboard/index.html',
        controller: "dashboardCtrl",
        data: {
            titulo: 'Dashboard'
        }
      })
    
      // CARD SERVICES
      /*.state('card-services', {
        abstract: true
      })*/
    
      .state('card-services-conciliacao-vendas', {
        url: prefixo + 'card-services/conciliacao-vendas',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-vendas/index.html',
        controller: "card-services-conciliacao-vendasCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
      .state('nao-autorizado', {
        url: prefixo + 'nao-autorizado',
        templateUrl: 'componentes/nao-autorizado/index.html',
        controller: "nao-autorizadoCtrl"
      })
    
      .state('nao-encontrado', {
        url: prefixo + 'nao-encontrado',
        templateUrl: 'componentes/nao-encontrado/index.html',
        controller: "nao-encontradoCtrl"
      });       
             
    $urlRouterProvider.otherwise(prefixo + 'nao-encontrado');
    
}])

// Init global settings and run the app
.run(['$rootScope', '$location', function($rootScope, $location) {
    // Título da página
    $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
        if(current.data) $rootScope.titulo = current.data.titulo;
    });
}]);